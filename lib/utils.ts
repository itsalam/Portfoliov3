import { clsx, type ClassValue } from "clsx";
import { random } from "lodash";
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

export function formatDate(dateStr: string): string {
  // Parse the input string into a Date object
  const date = new Date(dateStr);

  // Use toLocaleDateString to format the date
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short", // abbreviated month name
    year: "numeric", // full year
  });

  return formattedDate;
}

export const createThrottleQueue = (
  func: (...args: unknown[]) => unknown,
  range = [100, 300]
) => {
  const funcQueue: (typeof func)[] = [];
  let isProcessing = false;

  const processQueue = () => {
    if (funcQueue.length === 0) {
      isProcessing = false;
      return;
    }

    const waitTime = random(range[0], range[1]); // Random wait time between 500ms and 2000ms
    const call = funcQueue.shift();
    setTimeout(() => {
      call?.();
      processQueue();
    }, waitTime);
  };

  return () => {
    funcQueue.push(func);

    if (!isProcessing) {
      isProcessing = true;
      processQueue();
    }
  };
};
