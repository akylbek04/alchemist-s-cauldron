import type { Difficulty, ICauldronValues, IGameState, IIngredient, IReaction } from '../types.ts';
import { calculateCauldron } from './cauldron.ts';

export function getReactions(
  reactions: readonly IReaction[],
  difficulty: Difficulty,
): readonly IReaction[] {
  return reactions.filter((reaction) => reaction.difficulty === difficulty);
}

// The reactions of one game: `count` different ones from the difficulty pool.
export function pickReactions(
  pool: readonly IReaction[],
  count: number,
  random: () => number = Math.random,
): IReaction[] {
  const left = [...pool];
  const picked: IReaction[] = [];
  while (picked.length < count && left.length > 0) {
    picked.push(...left.splice(Math.floor(random() * left.length), 1));
  }
  return picked;
}

// Keeps the table order, which is also the order the reactions apply in.
export function getReactionsByIds(
  reactions: readonly IReaction[],
  ids: readonly string[],
): readonly IReaction[] {
  return reactions.filter((reaction) => ids.includes(reaction.id));
}

// Always rebuilt from the ingredient list: plain sums, then every active reaction.
export function getCauldronValues(
  ingredients: readonly IIngredient[],
  reactions: readonly IReaction[],
): ICauldronValues {
  return reactions
    .filter((reaction) => reaction.isActive(ingredients))
    .reduce((values, reaction) => reaction.apply(values), calculateCauldron(ingredients));
}

// A reaction fires only on the change from not active to active.
export function getFiredReactions(
  before: readonly IIngredient[],
  after: readonly IIngredient[],
  reactions: readonly IReaction[],
): IReaction[] {
  return reactions.filter((reaction) => !reaction.isActive(before) && reaction.isActive(after));
}

export function applyReactionCosts(state: IGameState, fired: readonly IReaction[]): IGameState {
  let next = state;
  for (const reaction of fired) {
    next = {
      ...next,
      timeLeft: Math.max(0, next.timeLeft - (reaction.timePenalty ?? 0)),
      lives: Math.max(0, next.lives - (reaction.lifePenalty ?? 0)),
      cauldronIngredients: reaction.clearsCauldron ? [] : next.cauldronIngredients,
    };
  }
  return next;
}
