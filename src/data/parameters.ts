import densityIcon from '../assets/icons/density.svg';
import magicIcon from '../assets/icons/magic.svg';
import temperatureIcon from '../assets/icons/temperature.svg';
import type { IParameter } from '../types.ts';

// Bar scales cover every recipe range; values outside pin the marker to the edge.
export const PARAMETERS: readonly IParameter[] = [
  {
    key: 'temperature',
    label: 'Temperature',
    short: 'T',
    icon: temperatureIcon,
    min: -80,
    max: 80,
  },
  { key: 'density', label: 'Density', short: 'D', icon: densityIcon, min: -60, max: 60 },
  { key: 'magicPower', label: 'Magic Power', short: 'MP', icon: magicIcon, min: 0, max: 80 },
];
