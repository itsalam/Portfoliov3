"use client";

import { useLoading } from "@/app/providers";
import { AnimationControls, motion, useMotionValue } from "framer-motion";
import { debounce } from "lodash";
import { ComponentProps, RefObject, useEffect, useState } from "react";
import { StoreApi, useStore } from "zustand";
import { SchemaStores } from "./fetchData";
import { Dimensions, GridStore } from "./state";

export const useResizeCallBack = (
  cb: ResizeObserverCallback,
  ...refs: RefObject<HTMLElement>[]
) => {
  useEffect(() => {
    // window.addEventListener("resize", cb);
    const elements = refs
      .map((ref) => ref.current)
      .filter(Boolean) as HTMLElement[];
    const resizeObserver = new ResizeObserver(cb);
    elements.forEach((e) => {
      resizeObserver.observe(e);
    });

    return () => {
      elements.length &&
        elements.forEach((e) => {
          resizeObserver.unobserve(e);
        });
      // window.removeEventListener("resize", cb);
    };
  }, [cb, refs]);
};

export const useCMSStoreInitializer = (
  store: StoreApi<Partial<SchemaStores>>
) => {
  const initialLoad = useMotionValue(true);

  const initialize = store.getInitialState().initialize;
  useEffect(() => {
    if (initialLoad.get() && initialize) {
      initialize();
      initialLoad.set(false);
    }
  }, [initialLoad, initialize]);
};

export function useResizeGridUpdate(store: StoreApi<GridStore>) {
  const initialLoad = useMotionValue(true);
  const [, setLoadingPromises] = useLoading();
  const updateDimensions = () => {
    const mainGrid = document
      ?.querySelector("#main")
      ?.getBoundingClientRect() as DOMRect;

    const dimensions = (
      mainGrid
        ? { width: mainGrid.width, height: mainGrid.height }
        : {
            width: typeof window !== "undefined" ? window.innerWidth : 0,
            height: typeof window !== "undefined" ? window.innerHeight : 0,
          }
    ) as Dimensions;
    return dimensions;
  };
  const setDimensions = useStore(store).setDimensions;
  const handleResize = debounce(
    () => {
      setDimensions(updateDimensions());
      if (initialLoad) {
        initialLoad.set(false);
        return;
      }
    },
    50,
    {
      trailing: true,
    }
  );

  useEffect(() => {
    const loadPromise = new Promise<void>((resolve) => {
      initialLoad.on("change", (initialLoad) => {
        !initialLoad.valueOf() && resolve();
      });
    });
    if (initialLoad.get()) {
      setLoadingPromises((curr) => curr.concat([loadPromise]));
      handleResize();
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize, initialLoad, setLoadingPromises]);
}

export const animateTransition = {
  initial: {
    y: "100%",
    opacity: 0.0,
  },
  show: {
    y: "0%",
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    y: "-100%",
    opacity: 0.0,
    transition: {
      duration: 0.133,
    },
  },
};

export function isAnimationControl(obj: object): obj is AnimationControls {
  return "start" in obj && typeof obj.start === "function";
}

export const maskScrollArea = (
  direction: "right" | "left" | "top" | "bottom",
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

export function p3ColorToArr(cssVarName: string): [number, number, number] {
  // Retrieve the CSS variable value from the root element
  const themeElem = document.querySelector(".radix-themes");
  if (!themeElem) {
    console.error(
      "Could not find the root element of the Radix UI theme. " +
        "Please make sure you're using Radix UI v1.0.0 or higher."
    );
    return [0, 0, 0];
  }
  const style = getComputedStyle(themeElem);
  const displayP3Color = style.getPropertyValue(cssVarName).trim();

  // Extract the numeric values from the color(display-p3 {r} {g} {b}) format
  const regex = /color\(display-p3\s+([^ ]+)\s+([^ ]+)\s+([^ ]+)\)/;
  const matches = displayP3Color.match(regex);

  if (!matches) {
    console.error("Invalid display-p3 color format: ", {
      displayP3Color,
      cssVarName,
    });
    return [0, 0, 0]; // Return default black in case of error
  }

  // Convert the extracted values to floats and normalize
  const r = parseFloat(matches[1]);
  const g = parseFloat(matches[2]);
  const b = parseFloat(matches[3]);
  return [r, g, b];
}

export function p3ToHex(cssVarName: string) {
  const [r, g, b] = p3ColorToArr(cssVarName).map((val) =>
    Math.round(val * 255)
  );
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
