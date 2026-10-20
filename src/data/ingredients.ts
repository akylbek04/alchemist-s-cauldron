import type { IIngredient } from '../types';
import dragonTears from '../assets/icons/dragon-tears.svg';
import fairyDust from '../assets/icons/fairy-dust.svg';
import frostLotus from '../assets/icons/frost-lotus.svg';
import mandrakeRoot from '../assets/icons/mandrake-root.svg';
import causticAcid from '../assets/icons/caustic-acid.svg';
import essenceOfTheVoid from '../assets/icons/essence-of-the-void.svg';
import phoenixFeather from '../assets/icons/phoenix-feather.svg';
import toadSlime from '../assets/icons/toad-slime.svg';

// Fixed order from the task README: the shelf always takes the first N entries.
export const INGREDIENTS: readonly IIngredient[] = [
  {
    id: 'dragon-tears',
    name: 'Dragon Tears',
    icon: dragonTears,
    temperature: 25,
    density: 8,
    magicPower: 10,
  },
  {
    id: 'fairy-dust',
    name: 'Fairy Dust',
    icon: fairyDust,
    temperature: 12,
    density: 9,
    magicPower: 12,
  },
  {
    id: 'frost-lotus',
    name: 'Frost Lotus',
    icon: frostLotus,
    temperature: -18,
    density: 4,
    magicPower: 14,
  },
  {
    id: 'mandrake-root',
    name: 'Mandrake Root',
    icon: mandrakeRoot,
    temperature: -5,
    density: 20,
    magicPower: 8,
  },
  {
    id: 'caustic-acid',
    name: 'Caustic Acid',
    icon: causticAcid,
    temperature: 10,
    density: 14,
    magicPower: 22,
  },
  {
    id: 'essence-of-the-void',
    name: 'Essence of the Void',
    icon: essenceOfTheVoid,
    temperature: -20,
    density: -10,
    magicPower: 40,
  },
  {
    id: 'phoenix-feather',
    name: 'Phoenix Feather',
    icon: phoenixFeather,
    temperature: 50,
    density: -10,
    magicPower: 30,
  },
  {
    id: 'toad-slime',
    name: 'Toad Slime',
    icon: toadSlime,
    temperature: 5,
    density: 30,
    magicPower: 0,
  },
];
