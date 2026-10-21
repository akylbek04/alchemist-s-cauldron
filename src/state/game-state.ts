import { DIFFICULTY_SETTINGS } from '../data/difficulty.ts';
import { INGREDIENTS } from '../data/ingredients.ts';
import { RECIPES } from '../data/recipes.ts';
import { getRecipesByDifficulty, pickRandom } from '../logic/recipe-generator.ts';
import { createStock } from '../logic/stock.ts';
import type {
  Difficulty,
  IDifficultySettings,
  IGameState,
  IIngredient,
  IRecipe,
} from '../types.ts';

export function getShelfIngredients(settings: IDifficultySettings): readonly IIngredient[] {
  return INGREDIENTS.slice(0, settings.shelfSize);
}

export function pickRecipe(difficulty: Difficulty): IRecipe {
  return pickRandom(getRecipesByDifficulty(RECIPES, difficulty));
}

export function createGameState(difficulty: Difficulty): IGameState {
  const settings = DIFFICULTY_SETTINGS[difficulty];
  return {
    difficulty,
    status: 'playing',
    score: 0,
    timeLeft: settings.startTime,
    lives: settings.lives,
    activeRecipe: pickRecipe(difficulty),
    cauldronIngredients: [],
    shelfStock: createStock(getShelfIngredients(settings)),
  };
}
