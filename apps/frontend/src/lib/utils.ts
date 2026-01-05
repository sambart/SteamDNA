import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPlaytime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  if (hours < 1) return `${minutes}m`;
  if (hours < 100) return `${hours}h`;
  return `${Math.round(hours / 10) * 10}+ hours`;
}
