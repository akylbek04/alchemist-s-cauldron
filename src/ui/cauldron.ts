import type { IIngredient } from '../types.ts';
import { createElement } from './dom.ts';

export function renderCauldron(list: HTMLElement, ingredients: readonly IIngredient[]): void {
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
}
