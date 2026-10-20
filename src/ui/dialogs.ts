import type { GameOverReason } from '../types.ts';

const GAME_OVER_TEXT: Record<GameOverReason, string> = {
  time: 'Time is up!',
  lives: 'No lives left!',
  ingredients: 'Out of ingredients',
};

export interface IGameOverElements {
  dialog: HTMLDialogElement;
  reason: HTMLElement;
  score: HTMLElement;
}

export function showGameOver(
  elements: IGameOverElements,
  reason: GameOverReason,
  score: number,
): void {
  elements.reason.textContent = GAME_OVER_TEXT[reason];
  elements.score.textContent = String(score);
  if (!elements.dialog.open) {
    elements.dialog.showModal();
  }
}
