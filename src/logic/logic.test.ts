// Run with `npm test` (Node's built-in runner strips the types).
import { addIngredient, calculateCauldron, isCauldronFull, isInRange } from './cauldron.ts';
import { getRecipesByDifficulty, pickRandom } from './recipe-generator.ts';
import { createStock, MAX_STOCK, MIN_STOCK } from './stock.ts';
import { DIFFICULTY_SETTINGS } from '../data/difficulty.ts';
import { RECIPES } from '../data/recipes.ts';
import { brew, canBrew, isBrewSuccessful } from './brew-check.ts';
import { getGameOverReason, isOutOfIngredients } from './game-over.ts';
import {
  addEntry,
  formatDate,
  isValidName,
  parseEntries,
  qualifies,
  sortEntries,
} from './leaderboard.ts';
import { formatTime, getEndTime, getTimeLeft } from './timer.ts';
import type { IGameState, IIngredient, ILeaderboardEntry, IRecipe } from '../types.ts';

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
  difficulty: 'medium',
  status: 'playing',
  score: 0,
  timeLeft: 150,
  lives: 3,
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
  difficulty: 'medium',
  status: 'playing',
  score: 0,
  timeLeft: 150,
  lives: 3,
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

// Brew check, README worked example: Moon Mist ±8 -> 24..50 / 4..30 / 9..35.
const medium = DIFFICULTY_SETTINGS.medium;

// Difficulty table from the README, row by row; Medium is the Level 1 rule set.
const table = (['easy', 'medium', 'hard'] as const).map((d) => {
  const x = DIFFICULTY_SETTINGS[d];
  return [
    x.shelfSize,
    x.maxCauldronIngredients,
    x.startTime,
    x.tolerance,
    x.lives,
    x.scorePerBrew,
    x.timeBonus,
    x.reactions,
  ].join();
});
check(table[0] === '4,4,180,12,5,100,15,0', `easy row, got ${String(table[0])}`);
check(table[1] === '6,4,150,8,3,200,10,2', `medium row, got ${String(table[1])}`);
check(table[2] === '8,5,150,5,3,300,5,3', `hard row, got ${String(table[2])}`);
check(isBrewSuccessful(mix, recipe, medium.tolerance), '37/17/22 must pass Moon Mist ±8');
check(
  isBrewSuccessful({ temperature: 50, density: 4, magicPower: 35 }, recipe, 8),
  'tolerance edges pass',
);
check(
  !isBrewSuccessful({ temperature: 51, density: 17, magicPower: 22 }, recipe, 8),
  'one value outside fails',
);

const next: IRecipe = { ...recipe, id: 'next' };
const brewing: IGameState = {
  difficulty: 'medium',
  status: 'playing',
  score: 0,
  timeLeft: 145,
  lives: 3,
  activeRecipe: recipe,
  cauldronIngredients: [tears, dust],
  shelfStock: { a: 1, b: 1 },
};
check(canBrew(brewing) && !canBrew({ ...brewing, cauldronIngredients: [] }), 'brew needs 1+');

const won = brew(brewing, medium, () => next);
check(won.success, 'worked example brews');
check(won.state.score === 200, 'success adds 200');
check(won.state.timeLeft === 150, 'time bonus is capped at the start time (145 + 10 -> 150)');
check(won.state.activeRecipe === next, 'success picks a new recipe');
check(won.state.cauldronIngredients.length === 0, 'success clears the cauldron');
check(won.state.shelfStock.a === 1 && won.state.lives === 3, 'stock and lives untouched');

const lost = brew({ ...brewing, cauldronIngredients: [frost] }, medium, () => next);
check(!lost.success, 'wrong mix fails');
check(lost.state.lives === 2 && lost.state.score === 0, 'failure costs 1 life, no score');
check(lost.state.activeRecipe === recipe, 'failure keeps the recipe');
check(lost.state.cauldronIngredients.length === 0, 'failure clears the cauldron');

// Time label.
check(formatTime(150) === '02:30' && formatTime(0) === '00:00', 'MM:SS format');
check(formatTime(0.4) === '00:01' && formatTime(-3) === '00:00', 'round up, never negative');

// Timer from timestamps: 150 s from t=1000 ms ends at 151000 ms.
const end = getEndTime(150, 1000);
check(getTimeLeft(end, 1000) === 150, 'full time at start');
check(getTimeLeft(end, 61000) === 90, '60 s later 90 s are left, however many ticks ran');
check(getTimeLeft(end, 999999) === 0, 'never below 0');

// Game over: lives first, then time, then ingredients.
check(getGameOverReason(brewing) === null, 'running game is not over');
check(getGameOverReason({ ...brewing, lives: 0 }) === 'lives', 'no lives');
check(getGameOverReason({ ...brewing, timeLeft: 0 }) === 'time', 'time is up');
const drained: IGameState = { ...brewing, cauldronIngredients: [], shelfStock: { a: 0, b: 0 } };
check(isOutOfIngredients(drained) && getGameOverReason(drained) === 'ingredients', 'out of stock');
check(
  !isOutOfIngredients({ ...drained, cauldronIngredients: [tears] }),
  'an empty shelf with a full cauldron can still be brewed',
);

// Leaderboard: sort by score, ties keep the earlier result higher, Top-10 only.
const entry = (name: string, score: number, date: number): ILeaderboardEntry => ({
  name,
  score,
  date,
});
const sorted = sortEntries([entry('Late', 500, 2), entry('Best', 900, 3), entry('Early', 500, 1)]);
check(sorted.map((e) => e.name).join() === 'Best,Early,Late', 'score desc, then earlier first');

const ten = Array.from({ length: 10 }, (_, i) => entry(`P${String(i)}`, 1000 - i * 100, i));
check(addEntry(ten, entry('New', 5000, 99)).length === 10, 'never more than 10');
check(addEntry(ten, entry('New', 5000, 99))[0]?.name === 'New', 'a top score goes first');
check(!addEntry(ten, entry('Low', 50, 99)).some((e) => e.name === 'Low'), 'low score drops out');

// Qualifying: the 10th place has 100 points.
check(qualifies([], 10) && !qualifies([], 0), 'empty board takes any score above 0');
check(qualifies(ten, 101) && !qualifies(ten, 100), 'must beat the 10th place, a tie stays out');
check(qualifies(ten.slice(0, 9), 1), 'free place available');

// Names: 2-15 chars, letters, digits, space, _ and -.
for (const ok of [
  'Al',
  'MagusPrime',
  'Mag_Prime-1',
  'Ivan Petrov',
  'Ålchemist',
  '  Bo  ',
  'A'.repeat(15),
]) {
  check(isValidName(ok), `"${ok}" should be valid`);
}
for (const bad of ['', 'A', '   ', 'A'.repeat(16), 'Bad!', '<b>x</b>', 'semi;colon']) {
  check(!isValidName(bad), `"${bad}" should be invalid`);
}

// Date: DD.MM.YYYY HH:MM (local time, so build the timestamp in local time too).
check(formatDate(new Date(2026, 9, 2, 12, 0).getTime()) === '02.10.2026 12:00', 'date format');
check(formatDate(new Date(2026, 0, 5, 9, 7).getTime()) === '05.01.2026 09:07', 'zero padding');

// Broken storage data never throws and keeps only valid entries.
check(parseEntries(null).length === 0 && parseEntries('x').length === 0, 'non-array is empty');
check(parseEntries({ length: 3 }).length === 0, 'array-like object is empty');
const mixed = parseEntries([
  entry('Good', 300, 1),
  { name: 'NoScore', date: 1 },
  { name: 'X', score: 10, date: 1 },
  { name: 'Neg', score: -5, date: 1 },
  { name: 'Nan', score: Number.NaN, date: 1 },
  null,
  'text',
  entry('Also', 400, 2),
]);
check(mixed.map((e) => e.name).join() === 'Also,Good', 'only valid entries, sorted');
