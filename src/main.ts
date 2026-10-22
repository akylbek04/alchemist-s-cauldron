import './styles/style.css';
import {
  DEFAULT_DIFFICULTY,
  DIFFICULTIES,
  DIFFICULTY_LABELS,
  DIFFICULTY_SETTINGS,
} from './data/difficulty.ts';
import { PARAMETERS } from './data/parameters.ts';
import { REACTIONS } from './data/reactions.ts';
import { brew, canBrew } from './logic/brew-check.ts';
import { addIngredient, canPourOut, isCauldronFull, pourOut } from './logic/cauldron.ts';
import { getGameOverReason } from './logic/game-over.ts';
import { addEntry, isValidName, qualifies } from './logic/leaderboard.ts';
import {
  applyReactionCosts,
  getCauldronValues,
  getFiredReactions,
  getReactions,
} from './logic/reactions.ts';
import { getEndTime, getTimeLeft } from './logic/timer.ts';
import { createGameState, getShelfIngredients, pickRecipe } from './state/game-state.ts';
import { clearLeaderboard, loadLeaderboard, saveLeaderboard } from './storage/leaderboard.ts';
import { clearSave, loadGame, saveGame } from './storage/save-game.ts';
import type {
  Difficulty,
  IDifficultySettings,
  IGameState,
  IIngredient,
  ILeaderboardEntry,
  IReaction,
} from './types.ts';
import { createBars } from './ui/bars.ts';
import { createDropZone, renderCauldron } from './ui/cauldron.ts';
import { showGameOver, showNameError } from './ui/dialogs.ts';
import { getElement } from './ui/dom.ts';
import { renderHud } from './ui/hud.ts';
import { renderLeaderboard } from './ui/leaderboard.ts';
import { createRecipePanel } from './ui/recipe.ts';
import { createSettingsPanel, renderHelp, renderReactions } from './ui/settings.ts';
import { createShelf, type UpdateShelf } from './ui/shelf.ts';

const hud = {
  score: getElement('#score'),
  time: getElement('#time'),
  timeGroup: getElement('#time-group'),
  timeBar: getElement('#time-bar'),
  lives: getElement('#lives'),
};
const gameOver = {
  dialog: getElement('#game-over-dialog') as HTMLDialogElement,
  reason: getElement('#game-over-reason'),
  score: getElement('#final-score'),
  nameForm: getElement('#name-form') as HTMLFormElement,
  nameInput: getElement('#player-name') as HTMLInputElement,
  nameError: getElement('#name-error'),
  saved: getElement('#saved-message'),
};
const leaderboard = {
  dialog: getElement('#leaderboard-dialog') as HTMLDialogElement,
  body: getElement('#leaderboard-body'),
  empty: getElement('#leaderboard-empty'),
  clearButton: getElement('#clear-leaderboard-button') as HTMLButtonElement,
  tabs: getElement('#leaderboard-tabs'),
};
const confirmDialog = getElement('#confirm-dialog') as HTMLDialogElement;
const confirmDifficulty = getElement('#confirm-difficulty');
const settingsButton = getElement('#settings-button');
const settingsDialog = getElement('#settings-dialog') as HTMLDialogElement;
const recipeNote = getElement('#recipe-note');
const leaderboardButton = getElement('#leaderboard-button');
const shelf = getElement('#shelf');
const cauldronList = getElement('#cauldron-list');
const message = getElement('#message');
const startButton = getElement('#start-button');
const continueButton = getElement('#continue-button');
const pauseNote = getElement('#pause-note');
const pauseButton = getElement('#pause-button') as HTMLButtonElement;
const clockIcon = getElement('#clock-icon');
const pauseDialog = getElement('#pause-dialog') as HTMLDialogElement;
const brewButton = getElement('#brew-button') as HTMLButtonElement;
const pourButton = getElement('#pour-button') as HTMLButtonElement;
const helpDialog = getElement('#help-dialog') as HTMLDialogElement;
const helpReactions = getElement('#help-reactions');

// null = start screen: empty shelf and cauldron, score and time 0, no lives.
let state: IGameState | null = null;
// Chosen in Settings on the start screen; a running game keeps its own state.difficulty.
let difficulty: Difficulty = DEFAULT_DIFFICULTY;
// An unfinished game found on page load, offered as Continue Game.
let savedGame = loadGame();
// The list shown in the leaderboard dialog.
let leaderboardDifficulty: Difficulty = DEFAULT_DIFFICULTY;

// While playing, the time left is always derived from this timestamp.
let endTime = 0;
let timerId: number | undefined;
const TICK_MS = 250;

const updateBars = createBars(getElement('#bars'), PARAMETERS);
const updateRecipe = createRecipePanel(
  getElement('#recipe-name'),
  getElement('#ingredient-counter'),
  getElement('#recipe-ranges'),
);
const updateSettings = createSettingsPanel(getElement('#settings-options'));

function getSettings(): IDifficultySettings {
  return DIFFICULTY_SETTINGS[state?.difficulty ?? difficulty];
}

function getActiveReactions(): readonly IReaction[] {
  return getReactions(REACTIONS, state?.difficulty ?? difficulty);
}

function addToCauldron(ingredient: IIngredient): void {
  if (state?.status !== 'playing') return;
  const next = addIngredient(state, ingredient, getSettings().maxCauldronIngredients);
  if (next === state) return;
  const fired = getFiredReactions(
    state.cauldronIngredients,
    next.cauldronIngredients,
    getActiveReactions(),
  );
  // Time costs need the current time left, and then a countdown from the new value.
  syncTime();
  state = applyReactionCosts({ ...next, timeLeft: state.timeLeft }, fired);
  startClock();
  showMessage(
    fired.map((reaction) => `${reaction.name}! ${reaction.effect}`).join(' · '),
    fired.length > 0 ? 'reaction' : undefined,
  );
  render();
  checkGameOver();
}

let updateShelf: UpdateShelf = createShelf(shelf, [], addToCauldron);

// A drop adds the same ingredient through the same checks as a click.
createDropZone(
  getElement('#cauldron'),
  () => state?.status === 'playing' && !isCauldronFull(state, getSettings().maxCauldronIngredients),
  (id) => {
    const ingredient = getShelfIngredients(getSettings()).find((item) => item.id === id);
    if (ingredient) {
      addToCauldron(ingredient);
    }
  },
);

// Shelf size, help numbers and the recipe note follow the chosen difficulty.
function applyDifficulty(): void {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  updateShelf = createShelf(shelf, getShelfIngredients(settings), addToCauldron);
  renderHelp(helpDialog, settings);
  renderReactions(helpReactions, getReactions(REACTIONS, difficulty));
  recipeNote.textContent = `${DIFFICULTY_LABELS[difficulty]} · brew tolerance ±${String(settings.tolerance)}`;
  updateSettings(difficulty);
}

function showMessage(text: string, type?: 'success' | 'failure' | 'reaction'): void {
  message.textContent = text;
  message.classList.toggle('message--success', type === 'success');
  message.classList.toggle('message--failure', type === 'failure');
  message.classList.toggle('message--reaction', type === 'reaction');
}

function startClock(): void {
  if (!state) return;
  endTime = getEndTime(state.timeLeft, Date.now());
  timerId ??= window.setInterval(tick, TICK_MS);
}

function stopClock(): void {
  window.clearInterval(timerId);
  timerId = undefined;
}

function syncTime(): void {
  if (state?.status === 'playing') {
    state = { ...state, timeLeft: getTimeLeft(endTime, Date.now()) };
  }
}

// Saves the running or paused game; finished games are cleared in checkGameOver.
function persist(): void {
  if (state && state.status !== 'game-over') {
    saveGame(state);
  }
}

function tick(): void {
  syncTime();
  if (!checkGameOver()) {
    updateHud();
    // Keeps the saved time left fresh in case the page closes without notice.
    persist();
  }
}

function checkGameOver(): boolean {
  if (state?.status !== 'playing') return false;
  const reason = getGameOverReason(state);
  if (!reason) return false;
  state = { ...state, status: 'game-over' };
  stopClock();
  clearSave();
  render();
  showGameOver(
    gameOver,
    reason,
    state.score,
    qualifies(loadLeaderboard(state.difficulty), state.score),
  );
  return true;
}

function pauseGame(): void {
  if (state?.status !== 'playing') return;
  syncTime();
  state = { ...state, status: 'paused' };
  stopClock();
  render();
  pauseNote.hidden = true;
  pauseDialog.showModal();
}

function resumeGame(): void {
  if (state?.status !== 'paused') return;
  state = { ...state, status: 'playing' };
  pauseDialog.close();
  startClock();
  render();
}

function exitToMenu(): void {
  stopClock();
  clearSave();
  savedGame = null;
  state = null;
  pauseDialog.close();
  showMessage('');
  render();
  startButton.focus();
}

// Restores the saved stock and recipe as they were, in paused state.
function continueGame(): void {
  if (state !== null || !savedGame) return;
  difficulty = savedGame.difficulty;
  applyDifficulty();
  state = { ...savedGame, status: 'paused' };
  savedGame = null;
  render();
  pauseNote.hidden = false;
  pauseDialog.showModal();
}

function startGame(): void {
  // The new game overwrites an old unfinished save on its first render.
  savedGame = null;
  state = createGameState(difficulty);
  startClock();
  showMessage('');
  if (gameOver.dialog.open) {
    gameOver.dialog.close();
  }
  render();
  shelf.querySelector('button')?.focus();
}

function updateHud(): void {
  renderHud(hud, {
    score: state?.score ?? 0,
    timeLeft: state?.timeLeft ?? 0,
    startTime: getSettings().startTime,
    lives: state?.lives ?? 0,
    isRunning: state?.status === 'playing',
  });
}

function render(): void {
  const settings = getSettings();
  const ingredients = state?.cauldronIngredients ?? [];
  const isPlaying = state?.status === 'playing';
  updateShelf(
    state?.shelfStock ?? {},
    !state || !isPlaying || isCauldronFull(state, settings.maxCauldronIngredients),
  );
  renderCauldron(cauldronList, ingredients);
  updateRecipe(state?.activeRecipe ?? null, ingredients.length, settings.maxCauldronIngredients);
  updateBars(getCauldronValues(ingredients, getActiveReactions()), state?.activeRecipe ?? null);
  updateHud();

  // While paused the play field is blurred, so nothing can be planned.
  document.body.classList.toggle('is-paused', state?.status === 'paused');
  pauseButton.hidden = !isPlaying;
  clockIcon.hidden = isPlaying;

  startButton.hidden = state !== null;
  // Difficulty can only be changed on the start screen.
  settingsButton.hidden = state !== null;
  leaderboardButton.hidden = state !== null;
  brewButton.hidden = state === null;
  brewButton.disabled = !state || !isPlaying || !canBrew(state);
  pourButton.hidden = state === null;
  pourButton.disabled = !state || !isPlaying || !canPourOut(state);
  continueButton.hidden = state !== null || savedGame === null;

  persist();
}

startButton.addEventListener('click', startGame);
continueButton.addEventListener('click', continueGame);
getElement('#play-again-button').addEventListener('click', startGame);

brewButton.addEventListener('click', () => {
  if (state?.status !== 'playing' || !canBrew(state)) return;
  syncTime();
  const before = state;
  const { difficulty: current } = state;
  const result = brew(
    state,
    DIFFICULTY_SETTINGS[current],
    () => pickRecipe(current),
    getActiveReactions(),
  );
  state = result.state;
  // The brew may add a time bonus: restart the countdown from the new time left.
  startClock();
  if (result.success) {
    // The time bonus is capped at the start time, so show what was really added.
    const timeGained = Math.round(state.timeLeft - before.timeLeft);
    const timeText = timeGained > 0 ? `, +${String(timeGained)} s` : '';
    showMessage(
      `${before.activeRecipe.name} brewed! +${String(state.score - before.score)} points${timeText}`,
      'success',
    );
  } else {
    showMessage('The mixture failed! −1 life', 'failure');
  }
  render();
  checkGameOver();
});

// Clears a wrong mix for 10 s instead of a life.
pourButton.addEventListener('click', () => {
  if (state?.status !== 'playing' || !canPourOut(state)) return;
  syncTime();
  state = pourOut(state);
  startClock();
  showMessage('Poured out! −10 s', 'failure');
  render();
  checkGameOver();
});

function openLeaderboard(
  shown: Difficulty = state?.difficulty ?? difficulty,
  highlight: ILeaderboardEntry | null = null,
): void {
  leaderboardDifficulty = shown;
  renderLeaderboard(leaderboard, shown, loadLeaderboard(shown), highlight);
  if (!leaderboard.dialog.open) {
    leaderboard.dialog.showModal();
  }
}

gameOver.nameForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (state?.status !== 'game-over') return;
  const name = gameOver.nameInput.value.trim();
  if (!isValidName(name)) {
    showNameError(gameOver, 'Use 2–15 letters, digits, spaces, _ or -.');
    gameOver.nameInput.focus();
    return;
  }
  const entry: ILeaderboardEntry = { name, score: state.score, date: Date.now() };
  if (!saveLeaderboard(state.difficulty, addEntry(loadLeaderboard(state.difficulty), entry))) {
    showNameError(gameOver, 'Could not save the result: browser storage is unavailable.');
    return;
  }
  // One result per game: hide the form so it can't be submitted twice.
  gameOver.nameForm.hidden = true;
  gameOver.saved.textContent = `Saved, ${name}!`;
  gameOver.saved.hidden = false;
  openLeaderboard(state.difficulty, entry);
});

gameOver.nameInput.addEventListener('input', () => {
  showNameError(gameOver, '');
});

leaderboardButton.addEventListener('click', () => {
  openLeaderboard();
});
getElement('#game-over-leaderboard-button').addEventListener('click', () => {
  openLeaderboard();
});
getElement('#leaderboard-back-button').addEventListener('click', () => {
  leaderboard.dialog.close();
});
leaderboard.tabs.addEventListener('click', (event) => {
  const tab = (event.target as HTMLElement).closest('button');
  const shown = DIFFICULTIES.find((item) => item === tab?.value);
  if (shown) {
    openLeaderboard(shown);
  }
});
leaderboard.clearButton.addEventListener('click', () => {
  confirmDifficulty.textContent = DIFFICULTY_LABELS[leaderboardDifficulty];
  confirmDialog.returnValue = '';
  confirmDialog.showModal();
});
// Custom in-app confirmation instead of confirm(): Esc or Cancel keeps the list.
confirmDialog.addEventListener('close', () => {
  if (confirmDialog.returnValue === 'confirm') {
    clearLeaderboard(leaderboardDifficulty);
    openLeaderboard(leaderboardDifficulty);
  }
});

pauseButton.addEventListener('click', pauseGame);
getElement('#resume-button').addEventListener('click', resumeGame);
getElement('#exit-button').addEventListener('click', exitToMenu);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    pauseGame();
  }
});

getElement('#help-button').addEventListener('click', () => {
  // The rules show the numbers of the current game, or of the chosen difficulty.
  renderHelp(helpDialog, getSettings());
  renderReactions(helpReactions, getActiveReactions());
  helpDialog.showModal();
});

settingsButton.addEventListener('click', () => {
  if (state !== null) return;
  settingsDialog.returnValue = '';
  settingsDialog.showModal();
});
// Each difficulty button submits its value; Back and Esc leave it empty.
settingsDialog.addEventListener('close', () => {
  const chosen = DIFFICULTIES.find((item) => item === settingsDialog.returnValue);
  if (!chosen || state !== null) return;
  difficulty = chosen;
  applyDifficulty();
  render();
});

applyDifficulty();
render();
