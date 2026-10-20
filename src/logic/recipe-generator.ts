import type { Difficulty, IRecipe } from '../types.ts';

export function getRecipesByDifficulty(
  recipes: readonly IRecipe[],
  difficulty: Difficulty,
): IRecipe[] {
  return recipes.filter((recipe) => recipe.difficulty === difficulty);
}

export function pickRandom<T>(items: readonly T[], random: () => number = Math.random): T {
  const item = items[Math.floor(random() * items.length)];
  if (item === undefined) {
    throw new Error('Cannot pick from an empty list');
  }
  return item;
}
