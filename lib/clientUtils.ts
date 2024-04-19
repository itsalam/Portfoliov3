"use client";

import { AnimationControls, motion } from "framer-motion";
import { ComponentProps, useEffect, useState } from "react";

export function isAnimationControl(obj: object): obj is AnimationControls {
  return "start" in obj && typeof obj.start === "function";
}

export type Direction = "right" | "left" | "top" | "bottom";

export const maskScrollArea = (
  direction: Direction,
  element: HTMLElement,
  percentage: number,
  threshold = 5
) => {
  const maskImageStep1 = percentage > 0 ? "rgba(0, 0, 0, 0) 0%, " : "";
  const maskImageStep2 = percentage < 100 ? ", rgba(0, 0, 0, 0) 100%" : "";
  const middleSteps = `rgb(0, 0, 0, 1) ${percentage * threshold}%, rgb(0, 0, 0, 1) ${percentage * threshold + 100 - threshold}%`;
  element.style.maskImage = `linear-gradient(to ${direction}, ${maskImageStep1}${middleSteps}${maskImageStep2})`;
};

export function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set debouncedValue to value (passed in) after the specified delay
    const handler = setTimeout(() => {
      console.log(value);
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes (also on component unmount), which is the debounce behavior
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function isAnimationControls(
  animate: ComponentProps<typeof motion.div>["animate"]
) {
  const animationControls = animate as AnimationControls;

  return (
    typeof animationControls !== "string" &&
    animationControls !== undefined &&
    "mount" in animationControls &&
    "start" in animationControls
  );
}

export function getCSSVarColor(cssVarName: string): string {
  const themeElem = document.querySelector(".radix-themes");
  if (!themeElem) {
    console.error(
      "Could not find the root element of the Radix UI theme. " +
        "Please make sure you're using Radix UI v1.0.0 or higher."
    );
    return "";
  }
  const style = getComputedStyle(themeElem);
  return style.getPropertyValue(cssVarName).trim();
}

export function p3ColorToArr(cssVarName: string): [number, number, number] {
  const cssVarValue = getCSSVarColor(cssVarName);
  const hexRegex = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/;
  const hexMatches = cssVarValue.match(hexRegex);
  const p3Regex = /color\(display-p3\s+([^ ]+)\s+([^ ]+)\s+([^ ]+)\)/;
  const P3matches = cssVarValue.match(p3Regex);
  if (hexMatches) {
    const [, r, g, b] = hexMatches.map((match) => parseInt(match, 16) / 255);
    return [r, g, b];
  } else if (P3matches) {
    const r = parseFloat(P3matches[1]);
    const g = parseFloat(P3matches[2]);
    const b = parseFloat(P3matches[3]);
    return [r, g, b];
  } else {
    console.error("Invalid display-p3 color format: ", {
      displayP3Color: cssVarValue,
      cssVarName,
    });
    return [0, 0, 0]; // Return default black in case of error
  }
}

export function p3ToHex(cssVarName: string) {
  const [r, g, b] = p3ColorToArr(cssVarName).map((val) =>
    Math.round(val * 255)
  );
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
