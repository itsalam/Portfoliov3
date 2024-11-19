"use client";

import { AnimationControls, m } from "framer-motion";
import { random } from "lodash";
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
  const maskImageStep2 = percentage < 1 ? ", rgba(0, 0, 0, 0) 100%" : "";
  const middleSteps = `rgb(0, 0, 0, 1) ${percentage * threshold}%, rgb(0, 0, 0, 1) ${percentage * threshold + 100 - threshold}%`;
  element.animate(
    {
      maskImage: `linear-gradient(to ${direction}, ${maskImageStep1}${middleSteps}${maskImageStep2})`,
    },
    { fill: "forwards" }
  );
};

export function useDebounce<T>(value: T, delay: number, variance = 0) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set debouncedValue to value (passed in) after the specified delay
    const modifiedDelay = random(-variance, variance) + delay;
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, modifiedDelay);

    // Cancel the timeout if value changes (also on component unmount), which is the debounce behavior
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, variance]);

  return [debouncedValue, setDebouncedValue] as [
    T,
    React.Dispatch<React.SetStateAction<T>>,
  ];
}

export function isAnimationControls(
  animate: ComponentProps<typeof m.div>["animate"]
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

export function cssVarToRGB(cssVarName: string): [number, number, number] {
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
  const [r, g, b] = cssVarToRGB(cssVarName).map((val) => Math.round(val * 255));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function isTouchDevice() {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

let webGLSupportCache: boolean | null = null;

export function isWebGLSupported() {
  if (webGLSupportCache !== null) {
    return webGLSupportCache;
  }

  try {
    const canvas = document.createElement("canvas");
    webGLSupportCache =
      !!window.WebGLRenderingContext &&
      (canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl")) !== null;
    canvas.remove();
    return webGLSupportCache;
  } catch (e) {
    webGLSupportCache = false;
    return false;
  }
}
