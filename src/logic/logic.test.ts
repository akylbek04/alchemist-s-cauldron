// Run with `npm test` (Node's built-in runner strips the types).
import {
  addIngredient,
  calculateCauldron,
  canPourOut,
  isCauldronFull,
  isInRange,
  pourOut,
} from './cauldron.ts';
import { getRecipesByDifficulty, pickRandom } from './recipe-generator.ts';
import { createStock, MAX_STOCK, MIN_STOCK } from './stock.ts';
import { DIFFICULTY_SETTINGS } from '../data/difficulty.ts';
import { REACTIONS } from '../data/reactions.ts';
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
import {
  applyReactionCosts,
  getCauldronValues,
  getFiredReactions,
  getReactions,
} from './reactions.ts';
import { parseSave } from './save.ts';
import { formatTime, getEndTime, getTimeLeft } from './timer.ts';
import type { Difficulty, IGameState, IIngredient, ILeaderboardEntry, IRecipe } from '../types.ts';

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

const won = brew(brewing, medium, () => next, []);
check(won.success, 'worked example brews');
check(won.state.score === 200, 'success adds 200');
check(won.state.timeLeft === 150, 'time bonus is capped at the start time (145 + 10 -> 150)');
check(won.state.activeRecipe === next, 'success picks a new recipe');
check(won.state.cauldronIngredients.length === 0, 'success clears the cauldron');
check(won.state.shelfStock.a === 1 && won.state.lives === 3, 'stock and lives untouched');

const lost = brew({ ...brewing, cauldronIngredients: [frost] }, medium, () => next, []);
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

// Save: valid unfinished games round-trip through JSON, the rest is rejected.
const catalogue: IIngredient[] = Array.from({ length: 8 }, (_, i) => ({
  ...tears,
  id: `i${String(i)}`,
}));
const easyRecipe = RECIPES.find((r) => r.difficulty === 'easy');
check(easyRecipe !== undefined, 'an easy recipe exists');
const saved: IGameState = {
  difficulty: 'easy',
  status: 'playing',
  score: 300,
  timeLeft: 97.25,
  lives: 4,
  activeRecipe: easyRecipe ?? recipe,
  cauldronIngredients: [catalogue[1] ?? tears, catalogue[1] ?? tears],
  shelfStock: { i0: 0, i1: 3, i2: 15, i3: 7 },
};
const restored = parseSave(JSON.parse(JSON.stringify(saved)), catalogue);
check(JSON.stringify(restored) === JSON.stringify(saved), 'a valid save is restored as it was');
check(restored?.cauldronIngredients[0] === catalogue[1], 'ingredients come from the catalogue');
check(restored?.activeRecipe === easyRecipe, 'the recipe comes from the recipe table');
check(parseSave({ ...saved, status: 'paused' }, catalogue)?.status === 'paused', 'paused is kept');

const broken: [string, unknown][] = [
  ['null', null],
  ['text', 'save'],
  ['finished game', { ...saved, status: 'game-over' }],
  ['no lives', { ...saved, lives: 0 }],
  ['no time', { ...saved, timeLeft: 0 }],
  [
    'out of ingredients',
    { ...saved, cauldronIngredients: [], shelfStock: { i0: 0, i1: 0, i2: 0, i3: 0 } },
  ],
  ['unknown difficulty', { ...saved, difficulty: 'insane' }],
  ['more lives than allowed', { ...saved, lives: 6 }],
  ['time above the start time', { ...saved, timeLeft: 181 }],
  ['NaN time', { ...saved, timeLeft: Number.NaN }],
  ['fractional score', { ...saved, score: 1.5 }],
  ['score as text', { ...saved, score: '300' }],
  [
    'recipe of another difficulty',
    { ...saved, activeRecipe: RECIPES.find((r) => r.difficulty === 'hard') },
  ],
  ['unknown recipe', { ...saved, activeRecipe: { id: 'nope' } }],
  ['stock above 15', { ...saved, shelfStock: { ...saved.shelfStock, i0: 16 } }],
  ['missing stock', { ...saved, shelfStock: { i0: 1, i1: 1, i2: 1 } }],
  [
    'stock of an ingredient not on this shelf',
    { ...saved, shelfStock: { ...saved.shelfStock, i5: 1 } },
  ],
  ['cauldron over the limit', { ...saved, cauldronIngredients: Array(5).fill(catalogue[0]) }],
  ['ingredient not on this shelf', { ...saved, cauldronIngredients: [catalogue[6]] }],
  ['cauldron not an array', { ...saved, cauldronIngredients: {} }],
];
for (const [name, data] of broken) {
  check(parseSave(data, catalogue) === null, `broken save must be rejected: ${name}`);
}

// Reactions: the count per difficulty comes from the difficulty table.
for (const level of ['easy', 'medium', 'hard'] as const satisfies readonly Difficulty[]) {
  const count = getReactions(REACTIONS, level).length;
  check(count === DIFFICULTY_SETTINGS[level].reactions, `${level} must have its reaction count`);
}
const medium3 = getReactions(REACTIONS, 'medium');
const hard3 = getReactions(REACTIONS, 'hard');
function real(id: string, temperature: number, density: number, magicPower: number): IIngredient {
  return { id, name: id, icon: '', temperature, density, magicPower };
}
const fairy = real('fairy-dust', 12, 9, 12);
const acid = real('caustic-acid', 10, 14, 22);
const dragon = real('dragon-tears', 25, 8, 10);
const lotus = real('frost-lotus', -18, 4, 14);
const phoenix = real('phoenix-feather', 50, -10, 30);
const voidEssence = real('essence-of-the-void', -20, -10, 40);
const slime = real('toad-slime', 5, 30, 0);
const mandrake = real('mandrake-root', -5, 20, 8);

// Values are rebuilt from the list: sums, then active reactions.
const bubbled = getCauldronValues([fairy, acid], medium3);
check(bubbled.magicPower === 51 && bubbled.temperature === 22, 'Bubbling: Magic Power 34 +50%');
check(getCauldronValues([fairy, acid], []).magicPower === 34, 'no reactions: plain sums');
check(getCauldronValues([fairy, acid], hard3).magicPower === 34, 'Medium reaction is off on Hard');
const frosted = getCauldronValues([dragon, lotus], medium3);
check(frosted.temperature === 0 && frosted.density === 14, 'Solar Frost: T 0, D 12 +20%');
const spiked = getCauldronValues([slime, slime, slime], hard3);
check(spiked.density === 70, 'Pressure Spike: Density 90 set to 70');
const rooted = getCauldronValues([mandrake, phoenix], hard3);
check(rooted.temperature === 60 && rooted.density === 9, 'Burning Root: T 45 +15, D 10 −10%');
check(getCauldronValues([mandrake, lotus], hard3).temperature === -23, 'Burning Root needs T ≥ 40');

// Fires only on the change from not active to active.
const names = (list: readonly { id: string }[]): string => list.map((r) => r.id).join();
check(names(getFiredReactions([fairy], [fairy, acid], medium3)) === 'bubbling', 'fires on start');
check(getFiredReactions([fairy, acid], [fairy, acid, dragon], medium3).length === 0, 'no refire');
check(
  names(getFiredReactions([fairy, acid, dragon], [fairy, acid, dragon, lotus], medium3)) ===
    'solar-frost',
  'a second reaction fires on its own',
);
check(names(getFiredReactions([], [fairy, acid], medium3)) === 'bubbling', 'fires again later');

// One-time costs.
const reacting: IGameState = { ...brewing, timeLeft: 8, cauldronIngredients: [fairy, acid] };
const bubbledState = applyReactionCosts(
  reacting,
  getFiredReactions([fairy], [fairy, acid], medium3),
);
check(bubbledState.timeLeft === 0 && bubbledState.lives === 3, 'Bubbling: −10 s, never below 0');
const volatile = applyReactionCosts(
  { ...brewing, cauldronIngredients: [phoenix, voidEssence] },
  getFiredReactions([phoenix], [phoenix, voidEssence], hard3),
);
check(
  volatile.lives === 2 && volatile.cauldronIngredients.length === 0,
  'Volatile Mix: −1 life, clear',
);

// Brew checks the reacted values: plain Magic Power 34 misses 45..55, Bubbling makes 51.
const bubblingRecipe: IRecipe = {
  ...recipe,
  temperature: { min: 17, max: 27 },
  density: { min: 18, max: 28 },
  magicPower: { min: 45, max: 55 },
};
const mixing: IGameState = {
  ...brewing,
  activeRecipe: bubblingRecipe,
  cauldronIngredients: [fairy, acid],
};
check(brew(mixing, medium, () => next, medium3).success, 'brew uses the reacted values');
check(!brew(mixing, medium, () => next, []).success, 'without the reaction the brew fails');

// Pour Out: clears the cauldron for 10 s, keeps lives, score, recipe and stock.
const poured = pourOut(brewing);
check(poured.cauldronIngredients.length === 0, 'pour out clears the cauldron');
check(poured.timeLeft === 135, 'pour out costs 10 s (145 -> 135)');
check(
  poured.lives === 3 && poured.score === 0 && poured.activeRecipe === recipe,
  'pour out keeps lives, score and recipe',
);
check(
  poured.shelfStock.a === 1 && poured.shelfStock.b === 1,
  'poured ingredients are not returned',
);
check(
  !canPourOut(poured) && pourOut(poured) === poured,
  'empty cauldron: no pour out, no time cost',
);
check(pourOut({ ...brewing, timeLeft: 4 }).timeLeft === 0, 'pour out never goes below 0 s');
