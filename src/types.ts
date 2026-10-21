export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameStatus = 'playing' | 'paused' | 'game-over';

export type GameOverReason = 'time' | 'lives' | 'ingredients';

export interface IIngredient {
  id: string;
  name: string;
  icon: string;
  temperature: number;
  density: number;
  magicPower: number;
}

export type ParameterKey = 'temperature' | 'density' | 'magicPower';

export type ICauldronValues = Record<ParameterKey, number>;

export interface IRecipeRange {
  min: number;
  max: number;
}

export interface IRecipe {
  id: string;
  name: string;
  difficulty: Difficulty;
  temperature: IRecipeRange;
  density: IRecipeRange;
  magicPower: IRecipeRange;
}

export interface IParameter {
  key: ParameterKey;
  label: string;
  short: string; // "T", "D", "MP" on the shelf cards
  icon: string;
  // Bar scale. A negative min puts 0 on the center line.
  min: number;
  max: number;
}

export interface IDifficultySettings {
  shelfSize: number;
  maxCauldronIngredients: number;
  startTime: number; // seconds
  tolerance: number;
  lives: number;
  scorePerBrew: number;
  timeBonus: number; // seconds
  reactions: number; // used from Level 3 on
}

export interface IGameState {
  difficulty: Difficulty;
  status: GameStatus;
  score: number;
  timeLeft: number; // seconds
  lives: number;
  activeRecipe: IRecipe;
  cauldronIngredients: IIngredient[];
  shelfStock: Record<string, number>; // ingredient id -> portions left
}

export interface ILeaderboardEntry {
  name: string;
  score: number;
  date: number; // timestamp from Date.now()
}
