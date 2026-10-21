import { parseEntries } from '../logic/leaderboard.ts';
import type { ILeaderboardEntry } from '../types.ts';

const STORAGE_KEY = 'alchemists-cauldron:leaderboard';

// localStorage can throw (blocked storage, private mode, full quota) and can hold
// broken data: every call is guarded so the game never crashes because of it.
export function loadLeaderboard(): ILeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseEntries(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export function saveLeaderboard(entries: readonly ILeaderboardEntry[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
}

export function clearLeaderboard(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
