import heartIcon from '../assets/icons/heart.svg';
import { formatTime } from '../logic/timer.ts';
import { createElement } from './dom.ts';

export function renderHud(
  elements: { score: HTMLElement; time: HTMLElement; lives: HTMLElement },
  score: number,
  timeLeft: number,
  lives: number,
): void {
  elements.score.textContent = String(score);
  elements.time.textContent = formatTime(timeLeft);
  elements.lives.setAttribute('aria-label', `Lives: ${String(lives)}`);
  if (elements.lives.childElementCount !== lives) {
    elements.lives.replaceChildren(
      ...Array.from({ length: lives }, () => {
        const heart = createElement('img', 'hud__heart');
        heart.src = heartIcon;
        heart.alt = '';
        return heart;
      }),
    );
  }
}
