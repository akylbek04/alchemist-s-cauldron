import { DIFFICULTY_SETTINGS } from '../data/difficulty';
import { INGREDIENTS } from '../data/ingredients';
import { RECIPES } from '../data/recipes';
import { getRecipesByDifficulty, pickRandom } from '../logic/recipe-generator';
import { createStock } from '../logic/stock';
import type { Difficulty, IDifficultySettings, IGameState, IIngredient } from '../types';

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
