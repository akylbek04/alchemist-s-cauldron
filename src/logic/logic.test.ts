// Run with `npm test` (Node's built-in runner strips the types).
import { addIngredient, isCauldronFull } from './cauldron.ts';
import { createStock, MAX_STOCK, MIN_STOCK } from './stock.ts';
import type { IGameState, IIngredient } from '../types.ts';

function check(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const tears: IIngredient = {
  id: 'a',
  name: 'A',
  icon: '',
  temperature: 25,
  density: 8,
  magicPower: 10,
};
const dust: IIngredient = {
  id: 'b',
  name: 'B',
  icon: '',
  temperature: 12,
  density: 9,
  magicPower: 12,
};

// Stock: whole numbers 2..15, including both edges of Math.random's range.
const low = createStock([tears], () => 0);
const high = createStock([tears], () => 0.9999);
check(low.a === MIN_STOCK, `min stock should be ${String(MIN_STOCK)}, got ${String(low.a)}`);
check(high.a === MAX_STOCK, `max stock should be ${String(MAX_STOCK)}, got ${String(high.a)}`);

// Add: keeps order, spends stock, allows repeats while stock > 0.
let state: IGameState = { cauldronIngredients: [], shelfStock: { a: 2, b: 1 } };
state = addIngredient(state, tears, 4);
state = addIngredient(state, dust, 4);
state = addIngredient(state, tears, 4);
check(state.cauldronIngredients.map((i) => i.id).join() === 'a,b,a', 'order must be kept');
check(state.shelfStock.a === 0 && state.shelfStock.b === 0, 'stock must go down by 1 per add');

// Out of stock: ignored, same state returned.
check(addIngredient(state, tears, 4) === state, 'empty ingredient must be ignored');

// Full cauldron: ignored, stock untouched.
const full: IGameState = { cauldronIngredients: [tears, tears], shelfStock: { a: 5 } };
check(isCauldronFull(full, 2), 'cauldron with 2 of 2 must be full');
check(addIngredient(full, tears, 2) === full, 'full cauldron must ignore adds');
