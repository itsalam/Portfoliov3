"use client";

import { useMotionValue, useSpring } from "framer-motion";
import { debounce } from "lodash";
import { RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { StoreApi } from "zustand";
import { GridStore } from "./providers/clientState";
import { Direction, maskScrollArea } from "./providers/clientUtils";
import { SchemaStores } from "./providers/fetchData";

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

export function useResizeGridUpdateRef<T extends HTMLElement>(
  store: StoreApi<GridStore>
) {
  const ref = useRef<T>(null);
  const { setDimensions } = store.getInitialState();

  useLayoutEffect(() => {
    const handleResize = debounce(
      () => {
        setDimensions(ref);
      },
      50,
      {
        trailing: true,
      }
    );
    window.addEventListener("resize", handleResize);
    setDimensions(ref);
    return () => window.removeEventListener("resize", handleResize);
  }, [setDimensions]);

  return ref;
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

export const useScrollMask = (
  ref: RefObject<HTMLElement>,
  direction: Direction = "bottom",
  spring?: boolean,
  targetRef?: RefObject<HTMLElement>
) => {
  const offset = useMotionValue(0);

  // A spring that will control the "bounce-back" effect
  const bounceSpring = useSpring(offset, {
    stiffness: 200,
    damping: 10,
  });

  const handleScroll: EventListener = () => {
    const elem = ref.current;
    if (elem) {
      const scrollTop = elem.scrollTop;
      const maxScroll = elem.scrollHeight - elem.clientHeight;
      const percent = scrollTop / maxScroll;
      if (percent >= 0) {
        maskScrollArea(
          direction,
          (targetRef ?? ref).current as HTMLElement,
          percent,
          5
        );
      }

      if (!spring) return;

      // If the user scrolls beyond the top or bottom boundaries
      if (scrollTop < 0) {
        offset.set(-scrollTop); // Set offset to create bounce-back effect
      } else if (scrollTop > maxScroll) {
        offset.set(maxScroll - scrollTop);
      } else {
        offset.set(0); // Reset offset when within bounds
      }
    }
  };

  useEffect(() => {
    maskScrollArea(direction, ref.current as HTMLElement, 0, 5);

    const container = ref.current;
    container?.addEventListener("wheel", handleScroll);

    return () => {
      container?.removeEventListener("wheel", handleScroll);
    };
  });

  return bounceSpring;
};

export function useCSSVars() {
  const ref = useRef<HTMLElement>();

  const getCSSVar = (variableName: string) =>
    ref.current
      ? getComputedStyle(ref.current).getPropertyValue(variableName).trim()
      : null;

  return { ref, getCSSVar };
}

export const useOutsideClick = (
  ref: React.RefObject<HTMLDivElement>,
  callback: (e: MouseEvent | TouchEvent) => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      callback(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, callback]);
};

let cachedWebGLSupport: boolean | null = null;

export const useWebGLSupport = () => {
  const [isWebGLSupported, setIsWebGLSupported] = useState(false);

  useEffect(() => {
    // Check if WebGL support is cached in localStorage
    const cachedResult = localStorage.getItem("webglSupport");
    if (cachedWebGLSupport) {
      setIsWebGLSupported(cachedResult === "true");
      return;
    }

    // Function to check WebGL support
    const checkWebGL = () => {
      try {
        const canvas =
          document.querySelectorAll("canvas")[0] ??
          document.createElement("canvas");
        const context =
          canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        return !!(window.WebGLRenderingContext && context);
      } catch (e) {
        console.error(e);
        return false;
      }
    };

    // Perform the check and cache the result
    const support = checkWebGL();
    setIsWebGLSupported(support);
    cachedWebGLSupport = support;
    localStorage.setItem("webglSupport", `${support}`);
  }, []);

  return isWebGLSupported;
};

// I recommend to declare breakpoints somewhere outside the component
// to prevent unnecessary re-renders.
//
// Otherwise don't forget to wrap it around React.useMemo:
// useBreakpoints(React.useMemo({ sm: 640, md: 768, ... }))
