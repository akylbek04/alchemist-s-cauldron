import type { IIngredient } from '../types.ts';
import { createElement } from './dom.ts';
import { DRAG_TYPE } from './shelf.ts';

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
