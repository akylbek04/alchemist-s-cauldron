import { isInRange } from '../logic/cauldron';
import type { ICauldronValues, IParameter, IRecipe } from '../types';
import { createElement, formatNumber, formatSigned } from './dom';

export type UpdateBars = (values: ICauldronValues, recipe: IRecipe) => void;

// Position of a value on the bar in %, clamped so off-scale values stay at the edge.
function toPercent(value: number, parameter: IParameter): number {
  const clamped = Math.min(Math.max(value, parameter.min), parameter.max);
  return ((clamped - parameter.min) / (parameter.max - parameter.min)) * 100;
}

function percent(value: number): string {
  return `${String(value)}%`;
}

function createBar(parameter: IParameter): {
  element: HTMLElement;
  update: UpdateBars;
} {
  const element = createElement('div', `bar bar--${parameter.key}`);
  const target = createElement('span', 'bar__target');
  const value = createElement('span', 'bar__value');
  const header = createElement('div', 'bar__header');
  header.append(createElement('span', 'bar__label', parameter.label), target, value);

  const track = createElement('div', 'bar__track');
  track.setAttribute('role', 'meter');
  track.setAttribute('aria-label', parameter.label);
  track.setAttribute('aria-valuemin', String(parameter.min));
  track.setAttribute('aria-valuemax', String(parameter.max));

  const zone = createElement('div', 'bar__zone');
  const fill = createElement('div', 'bar__fill');
  const marker = createElement('div', 'bar__marker');
  track.append(zone, fill);
  if (parameter.min < 0) {
    const zeroLine = createElement('div', 'bar__zero');
    zeroLine.style.left = percent(toPercent(0, parameter));
    track.append(zeroLine);
  }
  track.append(marker);
  element.append(header, track);

  const zero = toPercent(0, parameter);

  return {
    element,
    update: (values, recipe): void => {
      const current = values[parameter.key];
      const range = recipe[parameter.key];
      const at = toPercent(current, parameter);
      const zoneStart = toPercent(range.min, parameter);

      zone.style.left = percent(zoneStart);
      zone.style.width = percent(toPercent(range.max, parameter) - zoneStart);
      // The fill grows from 0, so negative values extend left of the center line.
      fill.style.left = percent(Math.min(zero, at));
      fill.style.width = percent(Math.abs(at - zero));
      marker.style.left = percent(at);

      const rangeText = `${formatNumber(range.min)}..${formatNumber(range.max)}`;
      value.textContent = formatSigned(current);
      target.textContent = `target ${rangeText}`;
      element.classList.toggle('bar--in-range', isInRange(current, range));
      track.setAttribute('aria-valuenow', String(current));
      track.setAttribute('aria-valuetext', `${formatSigned(current)}, target ${rangeText}`);
    },
  };
}

export function createBars(root: HTMLElement, parameters: readonly IParameter[]): UpdateBars {
  const bars = parameters.map(createBar);
  root.replaceChildren(...bars.map((bar) => bar.element));
  return (values, recipe) => {
    for (const bar of bars) {
      bar.update(values, recipe);
    }
  };
}
