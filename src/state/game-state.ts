import { INGREDIENTS } from '../data/ingredients';
import { createStock } from '../logic/stock';
import type { IDifficultySettings, IGameState, IIngredient } from '../types';

export function getShelfIngredients(settings: IDifficultySettings): readonly IIngredient[] {
  return INGREDIENTS.slice(0, settings.shelfSize);
}

export function createGameState(settings: IDifficultySettings): IGameState {
  return {
    cauldronIngredients: [],
    shelfStock: createStock(getShelfIngredients(settings)),
  };
}
