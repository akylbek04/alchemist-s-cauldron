import type { Difficulty, IDifficultySettings } from '../types.ts';

export const DIFFICULTY_SETTINGS: Record<Difficulty, IDifficultySettings> = {
  easy: { shelfSize: 4, maxCauldronIngredients: 4 },
  medium: { shelfSize: 6, maxCauldronIngredients: 4 },
  hard: { shelfSize: 8, maxCauldronIngredients: 5 },
};

// Level 1 always plays with the Medium rules.
export const LEVEL_1_DIFFICULTY: Difficulty = 'medium';
