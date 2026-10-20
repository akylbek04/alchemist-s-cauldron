// 95 -> "01:35". Partial seconds round up, so 0.4 s left still shows "00:01".
export function formatTime(seconds: number): string {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

// Remaining seconds from a timestamp, so ticks can be late or skipped (background tab).
export function getTimeLeft(endTime: number, now: number): number {
  return Math.max(0, (endTime - now) / 1000);
}

export function getEndTime(timeLeft: number, now: number): number {
  return now + timeLeft * 1000;
}
