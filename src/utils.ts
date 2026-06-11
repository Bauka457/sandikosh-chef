import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const haptic = {
  light: () => navigator.vibrate?.(10),
  medium: () => navigator.vibrate?.(25),
  heavy: () => navigator.vibrate?.(50),
  success: () => navigator.vibrate?.([30, 20, 60]),
  error: () => navigator.vibrate?.([80, 30, 80]),
  combo: (level: number) => navigator.vibrate?.(
    level >= 5 ? [100, 50, 100, 50, 100] : [50, 30, 50]
  ),
};
