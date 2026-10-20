import './styles/style.css';
import { DIFFICULTY_SETTINGS, LEVEL_1_DIFFICULTY } from './data/difficulty.ts';
import { PARAMETERS } from './data/parameters.ts';
import { addIngredient, calculateCauldron, isCauldronFull } from './logic/cauldron.ts';
import { createGameState, getShelfIngredients } from './state/game-state.ts';
import { createBars } from './ui/bars.ts';
import { renderCauldron } from './ui/cauldron.ts';
import { getElement } from './ui/dom.ts';
import { createShelf } from './ui/shelf.ts';

const settings = DIFFICULTY_SETTINGS[LEVEL_1_DIFFICULTY];
const cauldronList = getElement('#cauldron-list');
const counter = getElement('#ingredient-counter');

// Temporary: the game starts on load until the Start Game screen arrives in US 1.3.
let state = createGameState(LEVEL_1_DIFFICULTY);

const updateBars = createBars(getElement('#bars'), PARAMETERS);

const updateShelf = createShelf(
  getElement('#shelf'),
  getShelfIngredients(settings),
  (ingredient) => {
    const next = addIngredient(state, ingredient, settings.maxCauldronIngredients);
    if (next === state) return;
    state = next;
    render();
  },
);

function render(): void {
  updateShelf(state.shelfStock, isCauldronFull(state, settings.maxCauldronIngredients));
  updateBars(calculateCauldron(state.cauldronIngredients), state.activeRecipe);
  renderCauldron(cauldronList, counter, state.cauldronIngredients, settings.maxCauldronIngredients);
}

render();
