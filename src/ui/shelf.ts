import { PARAMETERS } from '../data/parameters.ts';
import type { IIngredient } from '../types.ts';
import { createElement, formatSigned } from './dom.ts';

// Custom type: a drop zone can see it in dragover (data itself is hidden until drop).
export const DRAG_TYPE = 'application/x-alchemist-ingredient';

export type UpdateShelf = (stock: Record<string, number>, isBlocked: boolean) => void;

interface ICard {
  ingredient: IIngredient;
  button: HTMLButtonElement;
  count: HTMLSpanElement;
}

function createCard(ingredient: IIngredient): ICard {
  const button = createElement('button', 'card');
  button.type = 'button';

  const icon = createElement('img', 'card__icon');
  icon.src = ingredient.icon;
  icon.alt = '';

  // Level 3: the card shows only the icon and name, the numbers live in a tooltip.
  const tooltip = createElement('span', 'tooltip');
  tooltip.id = `tooltip-${ingredient.id}`;
  tooltip.setAttribute('role', 'tooltip');
  for (const parameter of PARAMETERS) {
    const row = createElement('span', `tooltip__row tooltip__row--${parameter.key}`);
    const rowIcon = createElement('img', 'tooltip__icon');
    rowIcon.src = parameter.icon;
    rowIcon.alt = '';
    row.append(
      rowIcon,
      createElement('span', 'tooltip__label', parameter.label),
      createElement('span', 'tooltip__value', formatSigned(ingredient[parameter.key])),
    );
    tooltip.append(row);
  }
  button.setAttribute('aria-describedby', tooltip.id);

  const badge = createElement('span', 'card__badge');
  const count = createElement('span', '');
  badge.append(count, createElement('span', 'visually-hidden', ' left'));

  button.append(icon, createElement('span', 'card__name', ingredient.name), badge, tooltip);
  button.addEventListener('pointerenter', () => {
    placeTooltip(button, tooltip);
  });
  button.addEventListener('focus', () => {
    placeTooltip(button, tooltip);
  });
  return { ingredient, button, count };
}

const EDGE_GAP = 8;

// Opens the tooltip to the left near the right screen edge and upward near the bottom.
// The tooltip keeps its size while hidden, so it can be measured before it shows.
function placeTooltip(card: HTMLElement, tooltip: HTMLElement): void {
  const cardBox = card.getBoundingClientRect();
  const { width, height } = tooltip.getBoundingClientRect();
  const inset = parseFloat(getComputedStyle(card).getPropertyValue('--tooltip-inset')) || 0;
  const rightEdge = cardBox.left + inset + width;
  tooltip.classList.toggle('tooltip--left', rightEdge > window.innerWidth - EDGE_GAP);
  tooltip.classList.toggle('tooltip--up', cardBox.bottom + height > window.innerHeight - EDGE_GAP);
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
    button.addEventListener('dragstart', (event) => {
      // Empty slots, a full cauldron and pause all leave the button disabled.
      if (button.disabled || !event.dataTransfer) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.setData(DRAG_TYPE, ingredient.id);
      event.dataTransfer.effectAllowed = 'copy';
    });
  }
  root.replaceChildren(...cards.map((card) => card.button));

  return (stock, isBlocked) => {
    root.classList.toggle('shelf__list--blocked', isBlocked);
    for (const { ingredient, button, count } of cards) {
      const left = stock[ingredient.id] ?? 0;
      count.textContent = String(left);
      button.classList.toggle('card--empty', left === 0);
      button.disabled = left === 0 || isBlocked;
      button.draggable = !button.disabled;
    }
  };
}
