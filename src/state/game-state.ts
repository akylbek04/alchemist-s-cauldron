import { DIFFICULTY_SETTINGS } from '../data/difficulty.ts';
import { INGREDIENTS } from '../data/ingredients.ts';
import { RECIPES } from '../data/recipes.ts';
import { getRecipesByDifficulty, pickRandom } from '../logic/recipe-generator.ts';
import { createStock } from '../logic/stock.ts';
import type { Difficulty, IDifficultySettings, IGameState, IIngredient } from '../types.ts';

export function getShelfIngredients(settings: IDifficultySettings): readonly IIngredient[] {
  return INGREDIENTS.slice(0, settings.shelfSize);
}

export function createGameState(difficulty: Difficulty): IGameState {
  return {
    activeRecipe: pickRandom(getRecipesByDifficulty(RECIPES, difficulty)),
    cauldronIngredients: [],
    shelfStock: createStock(getShelfIngredients(DIFFICULTY_SETTINGS[difficulty])),
  };
}
