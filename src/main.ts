import './styles/style.css';
import { DIFFICULTY_SETTINGS, LEVEL_1_DIFFICULTY } from './data/difficulty.ts';
import { PARAMETERS } from './data/parameters.ts';
import { brew, canBrew } from './logic/brew-check.ts';
import { addIngredient, calculateCauldron, isCauldronFull } from './logic/cauldron.ts';
import { createGameState, getShelfIngredients, pickRecipe } from './state/game-state.ts';
import type { IGameState } from './types.ts';
import { createBars } from './ui/bars.ts';
import { renderCauldron } from './ui/cauldron.ts';
import { getElement } from './ui/dom.ts';
import { renderHud } from './ui/hud.ts';
import { createRecipePanel } from './ui/recipe.ts';
import { createShelf } from './ui/shelf.ts';

const settings = DIFFICULTY_SETTINGS[LEVEL_1_DIFFICULTY];

const hud = {
  score: getElement('#score'),
  time: getElement('#time'),
  lives: getElement('#lives'),
};
const shelf = getElement('#shelf');
const cauldronList = getElement('#cauldron-list');
const message = getElement('#message');
const startButton = getElement('#start-button');
const brewButton = getElement('#brew-button') as HTMLButtonElement;
const helpDialog = getElement('#help-dialog') as HTMLDialogElement;

// null = start screen: empty shelf and cauldron, score and time 0, no lives.
let state: IGameState | null = null;

const updateBars = createBars(getElement('#bars'), PARAMETERS);
const updateRecipe = createRecipePanel(
  getElement('#recipe-name'),
  getElement('#ingredient-counter'),
  getElement('#recipe-ranges'),
);
getElement('#recipe-note').textContent = `Brew tolerance ±${String(settings.tolerance)}`;

const updateShelf = createShelf(shelf, getShelfIngredients(settings), (ingredient) => {
  if (!state) return;
  const next = addIngredient(state, ingredient, settings.maxCauldronIngredients);
  if (next === state) return;
  state = next;
  showMessage('');
  render();
});

function showMessage(text: string, type?: 'success' | 'failure'): void {
  message.textContent = text;
  message.classList.toggle('message--success', type === 'success');
  message.classList.toggle('message--failure', type === 'failure');
}

function render(): void {
  const ingredients = state?.cauldronIngredients ?? [];
  updateShelf(
    state?.shelfStock ?? {},
    !state || isCauldronFull(state, settings.maxCauldronIngredients),
  );
  renderCauldron(cauldronList, ingredients);
  updateRecipe(state?.activeRecipe ?? null, ingredients.length, settings.maxCauldronIngredients);
  updateBars(calculateCauldron(ingredients), state?.activeRecipe ?? null);
  renderHud(hud, state?.score ?? 0, state?.timeLeft ?? 0, state?.lives ?? 0);

  startButton.hidden = state !== null;
  brewButton.hidden = state === null;
  brewButton.disabled = !state || !canBrew(state);
}

startButton.addEventListener('click', () => {
  state = createGameState(LEVEL_1_DIFFICULTY);
  showMessage('');
  render();
  shelf.querySelector('button')?.focus();
});

brewButton.addEventListener('click', () => {
  if (!state || !canBrew(state)) return;
  const before = state;
  const result = brew(state, settings, () => pickRecipe(LEVEL_1_DIFFICULTY));
  state = result.state;
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
});

getElement('#help-button').addEventListener('click', () => {
  helpDialog.showModal();
});

render();
