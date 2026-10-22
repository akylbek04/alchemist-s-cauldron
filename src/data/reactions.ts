import { calculateCauldron } from '../logic/cauldron.ts';
import type { IIngredient, IReaction } from '../types.ts';

function has(ingredients: readonly IIngredient[], ...ids: string[]): boolean {
  return ids.every((id) => ingredients.some((ingredient) => ingredient.id === id));
}

// Percent changes round to whole numbers, like every other value in the game.
function scale(value: number, percent: number): number {
  return Math.round(value * (1 + percent / 100));
}

// The subset of the task's reaction table used by this game: 2 on Medium, 3 on Hard
// (the count in DIFFICULTY_SETTINGS). Medium uses only ingredients from its 6-card shelf.
// Active reactions apply in this order.
export const REACTIONS: readonly IReaction[] = [
  {
    id: 'bubbling',
    name: 'Bubbling',
    difficulty: 'medium',
    trigger: 'Fairy Dust + Caustic Acid',
    effect: 'Magic Power +50%, −10 s',
    isActive: (ingredients) => has(ingredients, 'fairy-dust', 'caustic-acid'),
    apply: (values) => ({ ...values, magicPower: scale(values.magicPower, 50) }),
    timePenalty: 10,
  },
  {
    id: 'solar-frost',
    name: 'Solar Frost',
    difficulty: 'medium',
    trigger: 'Dragon Tears + Frost Lotus',
    effect: 'Temperature set to 0, Density +20%',
    isActive: (ingredients) => has(ingredients, 'dragon-tears', 'frost-lotus'),
    apply: (values) => ({ ...values, temperature: 0, density: scale(values.density, 20) }),
  },
  {
    id: 'volatile-mix',
    name: 'Volatile Mix',
    difficulty: 'hard',
    trigger: 'Phoenix Feather + Essence of the Void',
    effect: '−1 life, the cauldron is cleared',
    isActive: (ingredients) => has(ingredients, 'phoenix-feather', 'essence-of-the-void'),
    apply: (values) => values,
    lifePenalty: 1,
    clearsCauldron: true,
  },
  {
    id: 'pressure-spike',
    name: 'Pressure Spike',
    difficulty: 'hard',
    trigger: 'Total Density ≥ 70',
    effect: 'Density set to 70, Magic Power +10%',
    isActive: (ingredients) => calculateCauldron(ingredients).density >= 70,
    apply: (values) => ({ ...values, density: 70, magicPower: scale(values.magicPower, 10) }),
  },
  {
    id: 'burning-root',
    name: 'Burning Root',
    difficulty: 'hard',
    trigger: 'Mandrake Root + Phoenix Feather and total Temperature ≥ 40',
    effect: 'Temperature +15, Density −10%',
    isActive: (ingredients) =>
      has(ingredients, 'mandrake-root', 'phoenix-feather') &&
      calculateCauldron(ingredients).temperature >= 40,
    apply: (values) => ({
      ...values,
      temperature: values.temperature + 15,
      density: scale(values.density, -10),
    }),
  },
];
