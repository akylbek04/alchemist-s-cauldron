import { PARAMETERS } from '../data/parameters.ts';
import type { IRecipe } from '../types.ts';
import { createElement, formatNumber } from './dom.ts';

export type UpdateRecipe = (
  recipe: IRecipe | null,
  ingredientCount: number,
  maxIngredients: number,
) => void;

export function createRecipePanel(
  name: HTMLElement,
  counter: HTMLElement,
  ranges: HTMLElement,
): UpdateRecipe {
  const rows = PARAMETERS.map((parameter) => {
    const row = createElement('div', `recipe__range recipe__range--${parameter.key}`);
    const icon = createElement('img', 'recipe__icon');
    icon.src = parameter.icon;
    icon.alt = '';
    const term = createElement('dt', 'recipe__label');
    term.append(icon, parameter.label);
    const value = createElement('dd', 'recipe__value');
    row.append(term, value);
    return { parameter, value, row };
  });
  ranges.replaceChildren(...rows.map(({ row }) => row));

  return (recipe, ingredientCount, maxIngredients) => {
    name.textContent = recipe?.name ?? 'Press Start Game';
    for (const { parameter, value } of rows) {
      const range = recipe?.[parameter.key];
      value.textContent = range ? `${formatNumber(range.min)}..${formatNumber(range.max)}` : '—';
    }
    counter.textContent = `Ingredients: ${String(ingredientCount)} / ${String(maxIngredients)}`;
    counter.classList.toggle('counter--full', ingredientCount >= maxIngredients);
  };
}
