import type { IIngredient } from '../types.ts';
import { createElement, formatSigned } from './dom.ts';

export type UpdateShelf = (stock: Record<string, number>, isBlocked: boolean) => void;

interface ICard {
  ingredient: IIngredient;
  button: HTMLButtonElement;
  count: HTMLSpanElement;
}

function createStat(label: string, value: number, modifier: string): HTMLSpanElement {
  const stat = createElement('span', `card__stat card__stat--${modifier}`);
  stat.append(
    createElement('span', 'card__stat-label', label),
    createElement('span', 'card__stat-value', formatSigned(value)),
  );
  return stat;
}

function createCard(ingredient: IIngredient): ICard {
  const button = createElement('button', 'card');
  button.type = 'button';

  const badge = createElement('span', 'card__badge');
  const count = createElement('span', '');
  badge.append(count, createElement('span', 'visually-hidden', ' left'));

  const icon = createElement('img', 'card__icon');
  icon.src = ingredient.icon;
  icon.alt = '';

  const stats = createElement('span', 'card__stats');
  stats.append(
    createStat('Temperature', ingredient.temperature, 'temperature'),
    createStat('Density', ingredient.density, 'density'),
    createStat('Magic Power', ingredient.magicPower, 'magic'),
  );

  button.append(badge, icon, createElement('span', 'card__name', ingredient.name), stats);
  return { ingredient, button, count };
}

// Cards are built once and updated in place, so keyboard focus survives every add.
export function createShelf(
  root: HTMLElement,
  ingredients: readonly IIngredient[],
  onAdd: (ingredient: IIngredient) => void,
): UpdateShelf {
  const cards = ingredients.map(createCard);
  for (const { button, ingredient } of cards) {
    button.addEventListener('click', () => {
      onAdd(ingredient);
    });
  }
  root.replaceChildren(...cards.map((card) => card.button));

  return (stock, isBlocked) => {
    root.classList.toggle('shelf__grid--blocked', isBlocked);
    for (const { ingredient, button, count } of cards) {
      const left = stock[ingredient.id] ?? 0;
      count.textContent = String(left);
      button.classList.toggle('card--empty', left === 0);
      button.disabled = left === 0 || isBlocked;
    }
  };
}
