"use client";

import { AnimationControls } from "framer-motion";
import { debounce } from "lodash";
import { RefObject, useContext, useEffect } from "react";
import { useStore } from "zustand";
import { GridContext } from "./state";

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

function getWindowDimensions() {
  if (typeof window !== "undefined") {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  }
  // Default values when window is not available (e.g., during SSR)
  return { width: 0, height: 0 };
}

export function useWindowDimensions() {
  const store = useContext(GridContext)!;
  const setDimensions = useStore(store).setDimensions;
  const handleResize = debounce(
    () => setDimensions(getWindowDimensions()),
    200,
    { trailing: true }
  );

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);
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
