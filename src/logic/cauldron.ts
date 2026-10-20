import type { IGameState, IIngredient } from '../types';

export function isCauldronFull(state: IGameState, maxIngredients: number): boolean {
  return state.cauldronIngredients.length >= maxIngredients;
}

export function canAddIngredient(
  state: IGameState,
  ingredient: IIngredient,
  maxIngredients: number,
): boolean {
  return (state.shelfStock[ingredient.id] ?? 0) > 0 && !isCauldronFull(state, maxIngredients);
}

// Returns the same state object when the add is not allowed.
export function addIngredient(
  state: IGameState,
  ingredient: IIngredient,
  maxIngredients: number,
): IGameState {
  if (!canAddIngredient(state, ingredient, maxIngredients)) {
    return state;
  }
  return {
    ...state,
    cauldronIngredients: [...state.cauldronIngredients, ingredient],
    shelfStock: {
      ...state.shelfStock,
      [ingredient.id]: (state.shelfStock[ingredient.id] ?? 0) - 1,
    },
  };
}
