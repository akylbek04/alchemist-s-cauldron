import { formatDate } from '../logic/leaderboard.ts';
import type { ILeaderboardEntry } from '../types.ts';
import { createElement } from './dom.ts';

export interface ILeaderboardElements {
  body: HTMLElement;
  empty: HTMLElement;
  clearButton: HTMLButtonElement;
}

function isSameEntry(a: ILeaderboardEntry, b: ILeaderboardEntry | null): boolean {
  return b !== null && a.date === b.date && a.name === b.name && a.score === b.score;
}

export function renderLeaderboard(
  elements: ILeaderboardElements,
  entries: readonly ILeaderboardEntry[],
  highlight: ILeaderboardEntry | null = null,
): void {
  elements.body.replaceChildren(
    ...entries.map((entry, index) => {
      const row = createElement('tr', 'leaderboard__row');
      row.classList.toggle('leaderboard__row--new', isSameEntry(entry, highlight));
      const rank = createElement('td', 'leaderboard__rank');
      rank.append(createElement('span', `rank rank--${String(index + 1)}`, String(index + 1)));
      // Names go in as text only, never as HTML.
      row.append(
        rank,
        createElement('td', 'leaderboard__name', entry.name),
        createElement('td', 'leaderboard__score', String(entry.score)),
        createElement('td', 'leaderboard__date', formatDate(entry.date)),
      );
      return row;
    }),
  );
  elements.empty.hidden = entries.length > 0;
  elements.clearButton.disabled = entries.length === 0;
}
