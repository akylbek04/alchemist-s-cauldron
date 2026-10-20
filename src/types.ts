export type Difficulty = 'easy' | 'medium' | 'hard';

export interface IIngredient {
  id: string;
  name: string;
  icon: string;
  temperature: number;
  density: number;
  magicPower: number;
}

export interface IDifficultySettings {
  shelfSize: number;
  maxCauldronIngredients: number;
}

export interface IGameState {
  cauldronIngredients: IIngredient[];
  shelfStock: Record<string, number>; // ingredient id -> portions left
}
