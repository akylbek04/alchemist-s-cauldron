import type { ILeaderboardEntry } from '../types.ts';

export const LEADERBOARD_SIZE = 10;
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 15;

// Letters (any alphabet), digits, space, "_" and "-".
const NAME_PATTERN = /^[\p{L}\d _-]+$/u;

// Higher score first; on equal scores the earlier result stays higher.
export function sortEntries(entries: readonly ILeaderboardEntry[]): ILeaderboardEntry[] {
  return [...entries].sort((a, b) => b.score - a.score || a.date - b.date);
}

export function addEntry(
  entries: readonly ILeaderboardEntry[],
  entry: ILeaderboardEntry,
): ILeaderboardEntry[] {
  return sortEntries([...entries, entry]).slice(0, LEADERBOARD_SIZE);
}

// A new result is always the latest, so it only beats the 10th place with a higher score.
export function qualifies(entries: readonly ILeaderboardEntry[], score: number): boolean {
  if (score <= 0) return false;
  const sorted = sortEntries(entries);
  const last = sorted[LEADERBOARD_SIZE - 1];
  return !last || score > last.score;
}

export function isValidName(name: string): boolean {
  const trimmed = name.trim();
  return (
    trimmed.length >= NAME_MIN_LENGTH &&
    trimmed.length <= NAME_MAX_LENGTH &&
    NAME_PATTERN.test(trimmed)
  );
}

// "02.10.2026 12:00" in local time.
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const pad = (value: number): string => String(value).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${String(date.getFullYear())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function isEntry(value: unknown): value is ILeaderboardEntry {
  if (typeof value !== 'object' || value === null) return false;
  const { name, score, date } = value as Record<string, unknown>;
  return (
    typeof name === 'string' &&
    isValidName(name) &&
    typeof score === 'number' &&
    Number.isFinite(score) &&
    score >= 0 &&
    typeof date === 'number' &&
    Number.isFinite(date)
  );
}

// Loaded data is untrusted: keep only valid entries, never throw.
export function parseEntries(data: unknown): ILeaderboardEntry[] {
  if (!Array.isArray(data)) return [];
  return sortEntries(data.filter(isEntry)).slice(0, LEADERBOARD_SIZE);
}
