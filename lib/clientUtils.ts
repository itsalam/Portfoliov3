"use client";

import { useLoading } from "@/app/providers";
import { AnimationControls, useMotionValue } from "framer-motion";
import { debounce } from "lodash";
import { RefObject, useEffect, useState } from "react";
import { StoreApi, useStore } from "zustand";
import { Dimensions, GridStore } from "./state";

export const useResizeCallBack = (
  ref: RefObject<HTMLElement>,
  cb: () => void
) => {
  useEffect(() => {
    const element = ref.current;
    window.addEventListener("resize", cb);
    if (element) {
      const resizeObserver = new ResizeObserver(() => {
        cb();
      });
      resizeObserver.observe(element);
      return () => {
        resizeObserver.unobserve(element);
        window.removeEventListener("resize", cb);
      };
    }
    return () => window.removeEventListener("resize", cb);
  }, [cb, ref]);
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
  animate: {
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
  const middleSteps = `rgb(0, 0, 0) ${percentage * threshold}%, rgb(0, 0, 0) ${percentage * threshold + 100 - threshold}%`;
  element.style.maskImage = `linear-gradient(to ${direction}, ${maskImageStep1}${middleSteps}${maskImageStep2})`;
};

export function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set debouncedValue to value (passed in) after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes (also on component unmount), which is the debounce behavior
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
