// Run with `npm test` (Node's built-in runner strips the types).
import { addIngredient, calculateCauldron, isCauldronFull, isInRange } from './cauldron.ts';
import { getRecipesByDifficulty, pickRandom } from './recipe-generator.ts';
import { createStock, MAX_STOCK, MIN_STOCK } from './stock.ts';
import { RECIPES } from '../data/recipes.ts';
import type { IGameState, IIngredient, IRecipe } from '../types.ts';

function check(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const tears: IIngredient = {
  id: 'a',
  name: 'A',
  icon: '',
  temperature: 25,
  density: 8,
  magicPower: 10,
};
const recipe: IRecipe = {
  id: 'moon-mist',
  name: 'Moon Mist',
  difficulty: 'easy',
  temperature: { min: 32, max: 42 },
  density: { min: 12, max: 22 },
  magicPower: { min: 17, max: 27 },
};
const dust: IIngredient = {
  id: 'b',
  name: 'B',
  icon: '',
  temperature: 12,
  density: 9,
  magicPower: 12,
};

// Stock: whole numbers 2..15, including both edges of Math.random's range.
const low = createStock([tears], () => 0);
const high = createStock([tears], () => 0.9999);
check(low.a === MIN_STOCK, `min stock should be ${String(MIN_STOCK)}, got ${String(low.a)}`);
check(high.a === MAX_STOCK, `max stock should be ${String(MAX_STOCK)}, got ${String(high.a)}`);

// Add: keeps order, spends stock, allows repeats while stock > 0.
let state: IGameState = {
  activeRecipe: recipe,
  cauldronIngredients: [],
  shelfStock: { a: 2, b: 1 },
};
state = addIngredient(state, tears, 4);
state = addIngredient(state, dust, 4);
state = addIngredient(state, tears, 4);
check(state.cauldronIngredients.map((i) => i.id).join() === 'a,b,a', 'order must be kept');
check(state.shelfStock.a === 0 && state.shelfStock.b === 0, 'stock must go down by 1 per add');

// Out of stock: ignored, same state returned.
check(addIngredient(state, tears, 4) === state, 'empty ingredient must be ignored');

// Full cauldron: ignored, stock untouched.
const full: IGameState = {
  activeRecipe: recipe,
  cauldronIngredients: [tears, tears],
  shelfStock: { a: 5 },
};
check(isCauldronFull(full, 2), 'cauldron with 2 of 2 must be full');
check(addIngredient(full, tears, 2) === full, 'full cauldron must ignore adds');

// Sums: empty cauldron is 0 / 0 / 0; README worked example 25+12 / 8+9 / 10+12 = 37 / 17 / 22.
const empty = calculateCauldron([]);
check(empty.temperature === 0 && empty.density === 0 && empty.magicPower === 0, 'empty is 0/0/0');
const mix = calculateCauldron([tears, dust]);
check(
  mix.temperature === 37 && mix.density === 17 && mix.magicPower === 22,
  `worked example should be 37/17/22, got ${JSON.stringify(mix)}`,
);
const frost: IIngredient = { ...tears, temperature: -18 };
check(calculateCauldron([frost, frost]).temperature === -36, 'negative values must sum');

// Range: both edges are inside.
check(isInRange(32, recipe.temperature) && isInRange(42, recipe.temperature), 'edges are inside');
check(!isInRange(31, recipe.temperature) && !isInRange(43, recipe.temperature), 'outside edges');

// Recipes: filter by difficulty, random pick covers the whole list.
const other: IRecipe = { ...recipe, id: 'x', difficulty: 'hard' };
check(getRecipesByDifficulty([recipe, other], 'hard')[0] === other, 'filter by difficulty');
check(pickRandom([1, 2, 3], () => 0) === 1 && pickRandom([1, 2, 3], () => 0.9999) === 3, 'pick');

// Recipe table matches the README: 20 rows, 6 easy / 7 medium / 7 hard, valid ranges.
check(RECIPES.length === 20, 'there must be 20 recipes');
const counts = ['easy', 'medium', 'hard'].map(
  (d) => RECIPES.filter((r) => r.difficulty === d).length,
);
check(counts.join() === '6,7,7', `difficulty split should be 6,7,7, got ${counts.join()}`);
check(
  RECIPES.every((r) => [r.temperature, r.density, r.magicPower].every((x) => x.min < x.max)),
  'every range must have min < max',
);
