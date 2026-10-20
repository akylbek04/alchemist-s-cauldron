import type { Difficulty, IDifficultySettings } from '../types.ts';

// The difficulty table from the task README.
export const DIFFICULTY_SETTINGS: Record<Difficulty, IDifficultySettings> = {
  easy: {
    shelfSize: 4,
    maxCauldronIngredients: 4,
    startTime: 180,
    tolerance: 12,
    lives: 5,
    scorePerBrew: 100,
    timeBonus: 15,
  },
  medium: {
    shelfSize: 6,
    maxCauldronIngredients: 4,
    startTime: 150,
    tolerance: 8,
    lives: 3,
    scorePerBrew: 200,
    timeBonus: 10,
  },
  hard: {
    shelfSize: 8,
    maxCauldronIngredients: 5,
    startTime: 150,
    tolerance: 5,
    lives: 3,
    scorePerBrew: 300,
    timeBonus: 5,
  },
};

// Level 1 always plays with the Medium rules.
export const LEVEL_1_DIFFICULTY: Difficulty = 'medium';
