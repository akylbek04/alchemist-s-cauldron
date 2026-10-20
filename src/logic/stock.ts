import type { IIngredient } from '../types.ts';

export const MIN_STOCK = 2;
export const MAX_STOCK = 15;

export function createStock(
  ingredients: readonly IIngredient[],
  random: () => number = Math.random,
): Record<string, number> {
  const stock: Record<string, number> = {};
  for (const ingredient of ingredients) {
    stock[ingredient.id] = MIN_STOCK + Math.floor(random() * (MAX_STOCK - MIN_STOCK + 1));
  }
  return stock;
}
