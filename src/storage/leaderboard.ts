import { parseEntries } from '../logic/leaderboard.ts';
import type { Difficulty, ILeaderboardEntry } from '../types.ts';

// One Top-10 list per difficulty.
function getKey(difficulty: Difficulty): string {
  return `alchemists-cauldron:leaderboard:${difficulty}`;
}

// localStorage can throw (blocked storage, private mode, full quota) and can hold
// broken data: every call is guarded so the game never crashes because of it.
export function loadLeaderboard(difficulty: Difficulty): ILeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(getKey(difficulty));
    return raw ? parseEntries(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export function saveLeaderboard(
  difficulty: Difficulty,
  entries: readonly ILeaderboardEntry[],
): boolean {
  try {
    localStorage.setItem(getKey(difficulty), JSON.stringify(entries));
    return true;
  } catch {
    return false;
  }
}

export function clearLeaderboard(difficulty: Difficulty): boolean {
  try {
    localStorage.removeItem(getKey(difficulty));
    return true;
  } catch {
    return false;
  }
}
