export type Difficulty = 'easy' | 'medium' | 'hard';

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
  // Bar scale. A negative min puts 0 on the center line.
  min: number;
  max: number;
}

export interface IDifficultySettings {
  shelfSize: number;
  maxCauldronIngredients: number;
}

export interface IGameState {
  activeRecipe: IRecipe;
  cauldronIngredients: IIngredient[];
  shelfStock: Record<string, number>; // ingredient id -> portions left
}
