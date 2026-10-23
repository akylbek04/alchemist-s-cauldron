import { DIFFICULTIES, DIFFICULTY_LABELS, DIFFICULTY_SETTINGS } from '../data/difficulty.ts';
import type { Difficulty, IDifficultySettings, IReaction } from '../types.ts';
import { createElement } from './dom.ts';

export function describeReactions(count: number): string {
  if (count === 0) return 'no reactions';
  return `${String(count)} reaction${count === 1 ? '' : 's'}`;
}

// Short button text, built from the same settings the game uses.
export function describeDifficulty(settings: IDifficultySettings): string[] {
  return [
    `${String(settings.shelfSize)} ingredients · cauldron ${String(settings.maxCauldronIngredients)} · ${String(settings.startTime)} s · ${String(settings.lives)} lives`,
    `±${String(settings.tolerance)} · +${String(settings.scorePerBrew)} points · +${String(settings.timeBonus)} s · ${describeReactions(settings.reactions)}`,
  ];
}

// One submit button per difficulty inside a method="dialog" form: the chosen
// value comes back as the dialog's returnValue.
export function createSettingsPanel(root: HTMLElement): (current: Difficulty) => void {
  const buttons = DIFFICULTIES.map((difficulty) => {
    const button = createElement('button', `difficulty difficulty--${difficulty}`);
    button.value = difficulty;
    button.append(createElement('span', 'difficulty__name', DIFFICULTY_LABELS[difficulty]));
    for (const line of describeDifficulty(DIFFICULTY_SETTINGS[difficulty])) {
      button.append(createElement('span', 'difficulty__text', line));
    }
    return button;
  });
  root.replaceChildren(...buttons);

  return (current) => {
    for (const button of buttons) {
      button.setAttribute('aria-pressed', String(button.value === current));
    }
  };
}

// Fills the numbers in the Help rules: elements marked data-setting="<key>".
export function renderHelp(root: HTMLElement, settings: IDifficultySettings): void {
  for (const element of root.querySelectorAll<HTMLElement>('[data-setting]')) {
    const key = element.dataset.setting as keyof IDifficultySettings;
    element.textContent = String(settings[key]);
  }
}

// The reactions listed in Help, after a short intro line.
export function renderReactions(
  root: HTMLElement,
  reactions: readonly IReaction[],
  intro: string,
): void {
  if (reactions.length === 0) {
    root.replaceChildren(createElement('li', 'reactions__empty', 'No reactions on Easy.'));
    return;
  }
  root.replaceChildren(
    createElement('li', 'reactions__intro', intro),
    ...reactions.map((reaction) => {
      const item = createElement('li', 'reactions__item');
      item.append(
        createElement('strong', 'reactions__name', reaction.name),
        createElement('span', 'reactions__trigger', reaction.trigger),
        createElement('span', 'reactions__effect', reaction.effect),
      );
      return item;
    }),
  );
}
