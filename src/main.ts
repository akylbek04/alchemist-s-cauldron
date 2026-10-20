import './styles/style.css';
import { DIFFICULTY_SETTINGS, LEVEL_1_DIFFICULTY } from './data/difficulty.ts';
import { PARAMETERS } from './data/parameters.ts';
import { brew, canBrew } from './logic/brew-check.ts';
import { addIngredient, calculateCauldron, isCauldronFull } from './logic/cauldron.ts';
import { getGameOverReason } from './logic/game-over.ts';
import { getEndTime, getTimeLeft } from './logic/timer.ts';
import { createGameState, getShelfIngredients, pickRecipe } from './state/game-state.ts';
import type { IGameState } from './types.ts';
import { createBars } from './ui/bars.ts';
import { renderCauldron } from './ui/cauldron.ts';
import { showGameOver } from './ui/dialogs.ts';
import { getElement } from './ui/dom.ts';
import { renderHud } from './ui/hud.ts';
import { createRecipePanel } from './ui/recipe.ts';
import { createShelf } from './ui/shelf.ts';

const settings = DIFFICULTY_SETTINGS[LEVEL_1_DIFFICULTY];

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
};
const shelf = getElement('#shelf');
const cauldronList = getElement('#cauldron-list');
const message = getElement('#message');
const startButton = getElement('#start-button');
const pauseButton = getElement('#pause-button') as HTMLButtonElement;
const clockIcon = getElement('#clock-icon');
const pauseDialog = getElement('#pause-dialog') as HTMLDialogElement;
const brewButton = getElement('#brew-button') as HTMLButtonElement;
const helpDialog = getElement('#help-dialog') as HTMLDialogElement;

// null = start screen: empty shelf and cauldron, score and time 0, no lives.
let state: IGameState | null = null;

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
getElement('#recipe-note').textContent = `Brew tolerance ±${String(settings.tolerance)}`;

const updateShelf = createShelf(shelf, getShelfIngredients(settings), (ingredient) => {
  if (state?.status !== 'playing') return;
  const next = addIngredient(state, ingredient, settings.maxCauldronIngredients);
  if (next === state) return;
  state = next;
  showMessage('');
  render();
  checkGameOver();
});

function showMessage(text: string, type?: 'success' | 'failure'): void {
  message.textContent = text;
  message.classList.toggle('message--success', type === 'success');
  message.classList.toggle('message--failure', type === 'failure');
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

function tick(): void {
  syncTime();
  if (!checkGameOver()) {
    updateHud();
  }
}

function checkGameOver(): boolean {
  if (state?.status !== 'playing') return false;
  const reason = getGameOverReason(state);
  if (!reason) return false;
  state = { ...state, status: 'game-over' };
  stopClock();
  render();
  showGameOver(gameOver, reason, state.score);
  return true;
}

function pauseGame(): void {
  if (state?.status !== 'playing') return;
  syncTime();
  state = { ...state, status: 'paused' };
  stopClock();
  render();
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
  state = null;
  pauseDialog.close();
  showMessage('');
  render();
  startButton.focus();
}

function startGame(): void {
  state = createGameState(LEVEL_1_DIFFICULTY);
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
    startTime: settings.startTime,
    lives: state?.lives ?? 0,
    isRunning: state?.status === 'playing',
  });
}

function render(): void {
  const ingredients = state?.cauldronIngredients ?? [];
  const isPlaying = state?.status === 'playing';
  updateShelf(
    state?.shelfStock ?? {},
    !state || !isPlaying || isCauldronFull(state, settings.maxCauldronIngredients),
  );
  renderCauldron(cauldronList, ingredients);
  updateRecipe(state?.activeRecipe ?? null, ingredients.length, settings.maxCauldronIngredients);
  updateBars(calculateCauldron(ingredients), state?.activeRecipe ?? null);
  updateHud();

  // While paused the play field is blurred, so nothing can be planned.
  document.body.classList.toggle('is-paused', state?.status === 'paused');
  pauseButton.hidden = !isPlaying;
  clockIcon.hidden = isPlaying;

  startButton.hidden = state !== null;
  brewButton.hidden = state === null;
  brewButton.disabled = !state || !isPlaying || !canBrew(state);
}

startButton.addEventListener('click', startGame);
getElement('#play-again-button').addEventListener('click', startGame);

brewButton.addEventListener('click', () => {
  if (state?.status !== 'playing' || !canBrew(state)) return;
  syncTime();
  const before = state;
  const result = brew(state, settings, () => pickRecipe(LEVEL_1_DIFFICULTY));
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

pauseButton.addEventListener('click', pauseGame);
getElement('#resume-button').addEventListener('click', resumeGame);
getElement('#exit-button').addEventListener('click', exitToMenu);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    pauseGame();
  }
});

getElement('#help-button').addEventListener('click', () => {
  helpDialog.showModal();
});

render();
