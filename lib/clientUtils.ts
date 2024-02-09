"use client";

import { AnimationControls, useAnimation } from "framer-motion";
import { RefObject, useEffect, useRef, useState } from "react";

export const useScrollNavigation = (
  ref: RefObject<HTMLElement>,
  disable?: boolean,
  animationCallback?: (anim: AnimationControls) => void
) => {
  const isMounted = useRef(false);
  const controls = useAnimation();

  useEffect(() => {
    isMounted.current = true;

    controls.start("animate").then(() => {
      if (isMounted.current && animationCallback) {
        animationCallback(controls);
      }
    });

    return () => {
      isMounted.current = false;
    };
  }, [animationCallback, controls, isMounted]);

  return { controls, isMounted };
};

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
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
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
