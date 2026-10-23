import type { IIngredient } from '../types.ts';
import { createElement } from './dom.ts';
import { DRAG_TYPE } from './shelf.ts';

// The list under the pot, plus the same icons floating in the liquid.
export function renderCauldron(
  list: HTMLElement,
  floats: HTMLElement,
  ingredients: readonly IIngredient[],
): void {
  floats.replaceChildren(
    ...ingredients.map((ingredient, index) => {
      const icon = createElement('img', 'cauldron__float');
      icon.src = ingredient.icon;
      icon.alt = '';
      // Only the start offset comes from here; the movement is a CSS animation.
      icon.style.setProperty('--i', String(index));
      return icon;
    }),
  );
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

// Plays a CSS animation class again from the start (timing lives in the CSS).
// The other effect classes are removed so only the latest result shows.
export function playEffect(
  element: HTMLElement,
  effect: string,
  others: readonly string[] = [],
): void {
  element.classList.remove(effect, ...others);
  // Reading the layout makes the browser drop the old animation before it is added again.
  element.getBoundingClientRect();
  element.classList.add(effect);
}

// The cauldron accepts ingredient cards dragged from the shelf.
// `canDrop` is checked on every dragover, so pause and a full cauldron are respected.
export function createDropZone(
  zone: HTMLElement,
  canDrop: () => boolean,
  onDrop: (id: string) => void,
): void {
  const isValid = (event: DragEvent): boolean =>
    canDrop() && (event.dataTransfer?.types.includes(DRAG_TYPE) ?? false);
  const unhighlight = (): void => {
    zone.classList.remove('cauldron--drop');
  };

  zone.addEventListener('dragover', (event) => {
    if (!isValid(event)) {
      unhighlight();
      return;
    }
    // preventDefault marks the cauldron as a drop target.
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
    zone.classList.add('cauldron--drop');
  });
  zone.addEventListener('dragleave', (event) => {
    // Moving over the pot or the list inside the zone is not leaving it.
    if (!(event.relatedTarget instanceof Node && zone.contains(event.relatedTarget))) {
      unhighlight();
    }
  });
  zone.addEventListener('drop', (event) => {
    unhighlight();
    if (!isValid(event)) return;
    event.preventDefault();
    onDrop(event.dataTransfer?.getData(DRAG_TYPE) ?? '');
  });
}
