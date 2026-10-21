import heartIcon from '../assets/icons/heart.svg';
import { formatTime } from '../logic/timer.ts';
import { createElement } from './dom.ts';

export const LOW_TIME_SECONDS = 15;

export interface IHudElements {
  score: HTMLElement;
  time: HTMLElement;
  timeGroup: HTMLElement;
  timeBar: HTMLElement;
  lives: HTMLElement;
}

export interface IHudValues {
  score: number;
  timeLeft: number;
  startTime: number;
  lives: number;
  isRunning: boolean;
}

export function renderHud(elements: IHudElements, values: IHudValues): void {
  elements.score.textContent = String(values.score);
  elements.time.textContent = formatTime(values.timeLeft);
  const share = values.startTime > 0 ? values.timeLeft / values.startTime : 0;
  elements.timeBar.style.transform = `scaleX(${String(Math.min(1, share))})`;
  elements.timeGroup.classList.toggle(
    'hud__group--low',
    values.isRunning && values.timeLeft < LOW_TIME_SECONDS,
  );

  elements.lives.setAttribute('aria-label', `Lives: ${String(values.lives)}`);
  if (elements.lives.childElementCount !== values.lives) {
    elements.lives.replaceChildren(
      ...Array.from({ length: values.lives }, () => {
        const heart = createElement('img', 'hud__heart');
        heart.src = heartIcon;
        heart.alt = '';
        return heart;
      }),
    );
  }
}
