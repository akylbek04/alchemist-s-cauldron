import { DIFFICULTIES, DIFFICULTY_SETTINGS } from '../data/difficulty.ts';
import { RECIPES } from '../data/recipes.ts';
import type { IGameState, IIngredient } from '../types.ts';
import { getGameOverReason } from './game-over.ts';
import { MAX_STOCK } from './stock.ts';

function isWhole(value: unknown, min: number, max: number): value is number {
  return Number.isInteger(value) && (value as number) >= min && (value as number) <= max;
}

function getId(value: unknown): unknown {
  return typeof value === 'object' && value !== null ? (value as { id?: unknown }).id : undefined;
}

// Saved data is untrusted. It is checked field by field, and the recipe and
// ingredients are taken from the game's own tables by id, so edited numbers
// in storage can't change the rules. Returns null for broken or finished games.
// `catalogue` is the full ingredient list (passed in so this stays testable).
export function parseSave(data: unknown, catalogue: readonly IIngredient[]): IGameState | null {
  if (typeof data !== 'object' || data === null) return null;
  const save = data as Record<string, unknown>;

  const difficulty = DIFFICULTIES.find((item) => item === save.difficulty);
  if (!difficulty) return null;
  const settings = DIFFICULTY_SETTINGS[difficulty];
  if (save.status !== 'playing' && save.status !== 'paused') return null;

  const { score, timeLeft, lives } = save;
  if (!isWhole(score, 0, Number.MAX_SAFE_INTEGER) || !isWhole(lives, 1, settings.lives)) {
    return null;
  }
  if (typeof timeLeft !== 'number' || !(timeLeft > 0 && timeLeft <= settings.startTime)) {
    return null;
  }

  const recipeId = getId(save.activeRecipe);
  const activeRecipe = RECIPES.find((r) => r.id === recipeId && r.difficulty === difficulty);
  if (!activeRecipe) return null;

  const shelf = catalogue.slice(0, settings.shelfSize);
  const { shelfStock: rawStock, cauldronIngredients: rawCauldron } = save;
  if (typeof rawStock !== 'object' || rawStock === null) return null;
  const stock = rawStock as Record<string, unknown>;
  if (Object.keys(stock).length !== shelf.length) return null;
  const shelfStock: Record<string, number> = {};
  for (const { id } of shelf) {
    const left = stock[id];
    if (!isWhole(left, 0, MAX_STOCK)) return null;
    shelfStock[id] = left;
  }

  if (!Array.isArray(rawCauldron) || rawCauldron.length > settings.maxCauldronIngredients) {
    return null;
  }
  const cauldronIngredients: IIngredient[] = [];
  for (const item of rawCauldron) {
    const ingredient = shelf.find(({ id }) => id === getId(item));
    if (!ingredient) return null;
    cauldronIngredients.push(ingredient);
  }

  const state: IGameState = {
    difficulty,
    status: save.status,
    score,
    timeLeft,
    lives,
    activeRecipe,
    cauldronIngredients,
    shelfStock,
  };
  // A game that is already over is never offered as Continue.
  return getGameOverReason(state) ? null : state;
}
