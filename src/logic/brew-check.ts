import type {
  ICauldronValues,
  IDifficultySettings,
  IGameState,
  IRecipe,
  IReaction,
  IRecipeRange,
  ParameterKey,
} from '../types.ts';
import { clearCauldron, isInRange } from './cauldron.ts';
import { getCauldronValues } from './reactions.ts';

const PARAMETER_KEYS: readonly ParameterKey[] = ['temperature', 'density', 'magicPower'];

export interface IBrewResult {
  state: IGameState;
  success: boolean;
}

export function withTolerance(range: IRecipeRange, tolerance: number): IRecipeRange {
  return { min: range.min - tolerance, max: range.max + tolerance };
}

export function isBrewSuccessful(
  values: ICauldronValues,
  recipe: IRecipe,
  tolerance: number,
): boolean {
  return PARAMETER_KEYS.every((key) =>
    isInRange(values[key], withTolerance(recipe[key], tolerance)),
  );
}

export function canBrew(state: IGameState): boolean {
  return state.cauldronIngredients.length > 0;
}

// Ingredients are spent either way: the cauldron is cleared and stock is not returned.
export function brew(
  state: IGameState,
  settings: IDifficultySettings,
  nextRecipe: () => IRecipe,
  reactions: readonly IReaction[],
): IBrewResult {
  // The same values the bars show: sums with the active reactions applied.
  const success = isBrewSuccessful(
    getCauldronValues(state.cauldronIngredients, reactions),
    state.activeRecipe,
    settings.tolerance,
  );
  if (success) {
    return {
      success,
      state: {
        ...clearCauldron(state),
        score: state.score + settings.scorePerBrew,
        timeLeft: Math.min(settings.startTime, state.timeLeft + settings.timeBonus),
        activeRecipe: nextRecipe(),
      },
    };
  }
  return {
    success,
    state: { ...clearCauldron(state), lives: state.lives - 1 },
  };
}
