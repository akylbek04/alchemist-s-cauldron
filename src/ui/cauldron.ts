import type { IIngredient } from '../types';
import { createElement } from './dom';

export function renderCauldron(
  list: HTMLElement,
  counter: HTMLElement,
  ingredients: readonly IIngredient[],
  maxIngredients: number,
): void {
  list.replaceChildren(
    ...ingredients.map((ingredient) => {
      const item = createElement('li', 'cauldron__item');
      const icon = createElement('img', 'cauldron__item-icon');
      icon.src = ingredient.icon;
      icon.alt = '';
      item.append(icon, createElement('span', '', ingredient.name));
      return item;
    }),
  );
  counter.textContent = `Ingredients: ${String(ingredients.length)} / ${String(maxIngredients)}`;
  counter.classList.toggle('counter--full', ingredients.length >= maxIngredients);
}
