import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const clamp = function (num: number, min: number, max: number) {
  return Math.min(Math.max(num, min), max);
};

export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

export function createMutable<T>(baseObject: T): Mutable<T> {
  return Object.assign({}, baseObject);
}
