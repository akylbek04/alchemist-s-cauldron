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
  nameForm: HTMLFormElement;
  nameInput: HTMLInputElement;
  nameError: HTMLElement;
  saved: HTMLElement;
}

export function showNameError(elements: IGameOverElements, text: string): void {
  elements.nameError.textContent = text;
  elements.nameInput.setAttribute('aria-invalid', String(text !== ''));
}

// The name form is shown only when the score makes the Top-10.
export function showGameOver(
  elements: IGameOverElements,
  reason: GameOverReason,
  score: number,
  canSubmit: boolean,
): void {
  elements.reason.textContent = GAME_OVER_TEXT[reason];
  elements.score.textContent = String(score);
  elements.nameForm.hidden = !canSubmit;
  elements.nameInput.value = '';
  showNameError(elements, '');
  elements.saved.hidden = true;
  if (!elements.dialog.open) {
    elements.dialog.showModal();
  }
  if (canSubmit) {
    elements.nameInput.focus();
  }
}
