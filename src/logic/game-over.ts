import type { GameOverReason, IGameState } from '../types.ts';

export function isOutOfIngredients(state: IGameState): boolean {
  return (
    state.cauldronIngredients.length === 0 &&
    Object.values(state.shelfStock).every((left) => left <= 0)
  );
}

export function getGameOverReason(state: IGameState): GameOverReason | null {
  if (state.lives <= 0) return 'lives';
  if (state.timeLeft <= 0) return 'time';
  if (isOutOfIngredients(state)) return 'ingredients';
  return null;
}
