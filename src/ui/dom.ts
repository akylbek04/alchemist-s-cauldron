export function getElement(selector: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }
  return element;
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  element.className = className;
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

// "+25", "−18" (real minus sign), "0".
export function formatSigned(value: number): string {
  if (value > 0) return `+${String(value)}`;
  if (value < 0) return `−${String(Math.abs(value))}`;
  return '0';
}
