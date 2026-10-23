import type { ICauldronValues, IGameState, IIngredient, IRecipeRange } from '../types.ts';

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

export const POUR_OUT_TIME_COST = 10; // seconds

// Shared by brew and Pour Out: used ingredients are spent, never returned to the shelf.
export function clearCauldron(state: IGameState): IGameState {
  return { ...state, cauldronIngredients: [] };
}

export function canPourOut(state: IGameState): boolean {
  return state.cauldronIngredients.length > 0;
}

// Costs 10 s and no life. Returns the same state when the cauldron is already empty.
export function pourOut(state: IGameState): IGameState {
  if (!canPourOut(state)) {
    return state;
  }
  return { ...clearCauldron(state), timeLeft: Math.max(0, state.timeLeft - POUR_OUT_TIME_COST) };
}

export function calculateCauldron(ingredients: readonly IIngredient[]): ICauldronValues {
  const values: ICauldronValues = { temperature: 0, density: 0, magicPower: 0 };
  for (const ingredient of ingredients) {
    values.temperature += ingredient.temperature;
    values.density += ingredient.density;
    values.magicPower += ingredient.magicPower;
  }
  return values;
}

export function isInRange(value: number, range: IRecipeRange): boolean {
  return value >= range.min && value <= range.max;
}
