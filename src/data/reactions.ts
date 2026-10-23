import { calculateCauldron } from '../logic/cauldron.ts';
import type { IIngredient, IReaction } from '../types.ts';

function has(ingredients: readonly IIngredient[], ...ids: string[]): boolean {
  return ids.every((id) => ingredients.some((ingredient) => ingredient.id === id));
}

// Percent changes round to whole numbers, like every other value in the game.
// Integer math, so 115% of -10 is exactly -11.5 before rounding.
function scale(value: number, percent: number): number {
  return Math.round((value * (100 + percent)) / 100);
}

// The full reaction table from the task README. Each reaction belongs to one
// difficulty pool; every game picks DIFFICULTY_SETTINGS.reactions of them
// (2 on Medium, 3 on Hard). Medium's pool uses only its 6-card shelf.
// Stats triggers use the plain sums, before any reaction. Active reactions apply in this order.
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
    id: 'solar-frost',
    name: 'Solar Frost',
    difficulty: 'medium',
    trigger: 'Dragon Tears + Frost Lotus',
    effect: 'Temperature set to 0, Density +20%',
    isActive: (ingredients) => has(ingredients, 'dragon-tears', 'frost-lotus'),
    apply: (values) => ({ ...values, temperature: 0, density: scale(values.density, 20) }),
  },
  {
    id: 'rooted-steam',
    name: 'Rooted Steam',
    difficulty: 'hard',
    trigger: 'Mandrake Root + Toad Slime',
    effect: 'Density +25%, Magic Power −10%',
    isActive: (ingredients) => has(ingredients, 'mandrake-root', 'toad-slime'),
    apply: (values) => ({
      ...values,
      density: scale(values.density, 25),
      magicPower: scale(values.magicPower, -10),
    }),
  },
  {
    id: 'ashen-bloom',
    name: 'Ashen Bloom',
    difficulty: 'hard',
    trigger: 'Phoenix Feather + Fairy Dust',
    effect: 'Temperature +10, Magic Power +25%',
    isActive: (ingredients) => has(ingredients, 'phoenix-feather', 'fairy-dust'),
    apply: (values) => ({
      ...values,
      temperature: values.temperature + 10,
      magicPower: scale(values.magicPower, 25),
    }),
  },
  {
    id: 'annihilation',
    name: 'Annihilation',
    difficulty: 'medium',
    trigger: 'One ingredient with Temperature > +15 and another with Temperature < −15',
    effect: 'Temperature set to 0, Density ×2',
    isActive: (ingredients) =>
      ingredients.some((item) => item.temperature > 15) &&
      ingredients.some((item) => item.temperature < -15),
    apply: (values) => ({ ...values, temperature: 0, density: values.density * 2 }),
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
    id: 'magma-flux',
    name: 'Magma Flux',
    difficulty: 'hard',
    trigger: 'Total Temperature ≥ 60',
    effect: 'Magic Power +20%, Density −10%',
    isActive: (ingredients) => calculateCauldron(ingredients).temperature >= 60,
    apply: (values) => ({
      ...values,
      magicPower: scale(values.magicPower, 20),
      density: scale(values.density, -10),
    }),
  },
  {
    id: 'deep-freeze',
    name: 'Deep Freeze',
    difficulty: 'medium',
    trigger: 'Total Temperature ≤ −20',
    effect: 'Density +15%, Magic Power −15%',
    isActive: (ingredients) => calculateCauldron(ingredients).temperature <= -20,
    apply: (values) => ({
      ...values,
      density: scale(values.density, 15),
      magicPower: scale(values.magicPower, -15),
    }),
  },
  {
    id: 'arcane-saturation',
    name: 'Arcane Saturation',
    difficulty: 'hard',
    trigger: 'Total Magic Power ≥ 80',
    effect: 'Magic Power set to 80, Temperature +5',
    isActive: (ingredients) => calculateCauldron(ingredients).magicPower >= 80,
    apply: (values) => ({ ...values, magicPower: 80, temperature: values.temperature + 5 }),
  },
  {
    id: 'steam-burst',
    name: 'Steam Burst',
    difficulty: 'medium',
    trigger: 'Dragon Tears + Caustic Acid and total Temperature ≥ 35',
    effect: 'Temperature +10, −5 s',
    isActive: (ingredients) =>
      has(ingredients, 'dragon-tears', 'caustic-acid') &&
      calculateCauldron(ingredients).temperature >= 35,
    apply: (values) => ({ ...values, temperature: values.temperature + 10 }),
    timePenalty: 5,
  },
  {
    id: 'black-ice',
    name: 'Black Ice',
    difficulty: 'medium',
    trigger: 'Frost Lotus + Essence of the Void and total Density ≤ 0',
    effect: 'Temperature −10, Magic Power +20%',
    isActive: (ingredients) =>
      has(ingredients, 'frost-lotus', 'essence-of-the-void') &&
      calculateCauldron(ingredients).density <= 0,
    apply: (values) => ({
      ...values,
      temperature: values.temperature - 10,
      magicPower: scale(values.magicPower, 20),
    }),
  },
  {
    id: 'heavy-spark',
    name: 'Heavy Spark',
    difficulty: 'hard',
    trigger: 'Fairy Dust + Toad Slime and total Density ≥ 40',
    effect: 'Density +20%, Magic Power +10%',
    isActive: (ingredients) =>
      has(ingredients, 'fairy-dust', 'toad-slime') && calculateCauldron(ingredients).density >= 40,
    apply: (values) => ({
      ...values,
      density: scale(values.density, 20),
      magicPower: scale(values.magicPower, 10),
    }),
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
  {
    id: 'void-resonance',
    name: 'Void Resonance',
    difficulty: 'medium',
    trigger: 'Essence of the Void + Dragon Tears and total Magic Power ≥ 50',
    effect: 'Magic Power +30%, Temperature −5',
    isActive: (ingredients) =>
      has(ingredients, 'essence-of-the-void', 'dragon-tears') &&
      calculateCauldron(ingredients).magicPower >= 50,
    apply: (values) => ({
      ...values,
      magicPower: scale(values.magicPower, 30),
      temperature: values.temperature - 5,
    }),
  },
];
