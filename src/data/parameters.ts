import type { IParameter } from '../types.ts';

export const PARAMETERS: readonly IParameter[] = [
  { key: 'temperature', label: 'Temperature', min: -100, max: 100 },
  { key: 'density', label: 'Density', min: -100, max: 100 },
  { key: 'magicPower', label: 'Magic Power', min: 0, max: 100 },
];
