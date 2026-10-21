import { isInRange } from '../logic/cauldron.ts';
import type { ICauldronValues, IParameter, IRecipe } from '../types.ts';
import { createElement, formatNumber, formatSigned } from './dom.ts';

export type UpdateBars = (values: ICauldronValues, recipe: IRecipe | null) => void;

const TICK_COUNT = 5;

// Position of a value on the bar in %, clamped so off-scale values stay at the edge.
function toPercent(value: number, parameter: IParameter): number {
  const clamped = Math.min(Math.max(value, parameter.min), parameter.max);
  return ((clamped - parameter.min) / (parameter.max - parameter.min)) * 100;
}

function percent(value: number): string {
  return `${String(value)}%`;
}

function createTicks(parameter: IParameter): HTMLElement {
  const ticks = createElement('div', 'bar__ticks');
  ticks.setAttribute('aria-hidden', 'true');
  const step = (parameter.max - parameter.min) / (TICK_COUNT - 1);
  for (let i = 0; i < TICK_COUNT; i++) {
    const value = parameter.min + step * i;
    const tick = createElement('span', 'bar__tick', formatNumber(value));
    tick.style.left = percent(toPercent(value, parameter));
    ticks.append(tick);
  }
  return ticks;
}

function createBar(parameter: IParameter): { element: HTMLElement; update: UpdateBars } {
  const element = createElement('div', `bar bar--${parameter.key}`);
  const icon = createElement('img', 'bar__icon');
  icon.src = parameter.icon;
  icon.alt = '';

  const value = createElement('span', 'bar__value');
  const header = createElement('div', 'bar__header');
  header.append(createElement('span', 'bar__label', parameter.label), value);

  const track = createElement('div', 'bar__track');
  track.setAttribute('role', 'meter');
  track.setAttribute('aria-label', parameter.label);
  track.setAttribute('aria-valuemin', String(parameter.min));
  track.setAttribute('aria-valuemax', String(parameter.max));

  const zone = createElement('div', 'bar__zone');
  const marker = createElement('div', 'bar__marker');
  track.append(zone);
  if (parameter.min < 0) {
    const zeroLine = createElement('div', 'bar__zero');
    zeroLine.style.left = percent(toPercent(0, parameter));
    track.append(zeroLine);
  }
  track.append(marker);

  const body = createElement('div', 'bar__body');
  body.append(header, track, createTicks(parameter));
  element.append(icon, body);

  return {
    element,
    update: (values, recipe): void => {
      const current = values[parameter.key];
      const range = recipe?.[parameter.key];
      marker.style.left = percent(toPercent(current, parameter));
      value.textContent = formatSigned(current);
      track.setAttribute('aria-valuenow', String(current));

      zone.hidden = !range;
      element.classList.toggle('bar--in-range', range ? isInRange(current, range) : false);
      if (!range) {
        track.setAttribute('aria-valuetext', formatSigned(current));
        return;
      }
      const zoneStart = toPercent(range.min, parameter);
      zone.style.left = percent(zoneStart);
      zone.style.width = percent(toPercent(range.max, parameter) - zoneStart);
      track.setAttribute(
        'aria-valuetext',
        `${formatSigned(current)}, target ${formatNumber(range.min)} to ${formatNumber(range.max)}`,
      );
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
