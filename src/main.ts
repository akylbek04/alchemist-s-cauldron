import './styles/style.css';
import { DIFFICULTY_SETTINGS, LEVEL_1_DIFFICULTY } from './data/difficulty';
import { PARAMETERS } from './data/parameters';
import { addIngredient, calculateCauldron, isCauldronFull } from './logic/cauldron';
import { createGameState, getShelfIngredients } from './state/game-state';
import { createBars } from './ui/bars';
import { renderCauldron } from './ui/cauldron';
import { getElement } from './ui/dom';
import { createShelf } from './ui/shelf';

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
