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

// "−18" with a real minus sign.
export function formatNumber(value: number): string {
  return value < 0 ? `−${String(Math.abs(value))}` : String(value);
}

// "+25", "−18", "0".
export function formatSigned(value: number): string {
  return value > 0 ? `+${String(value)}` : formatNumber(value);
}
