import { INGREDIENTS } from '../data/ingredients.ts';
import { parseSave } from '../logic/save.ts';
import type { IGameState } from '../types.ts';

const STORAGE_KEY = 'alchemists-cauldron:save';

// Same rule as the leaderboard: storage errors never crash the game.
export function saveGame(state: IGameState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear when storage is blocked.
  }
}

// A broken save is deleted, and the game starts normally.
export function loadGame(): IGameState | null {
  let state: IGameState | null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    state = parseSave(JSON.parse(raw), INGREDIENTS);
  } catch {
    state = null;
  }
  if (!state) {
    clearSave();
  }
  return state;
}
