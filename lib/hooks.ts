"use client";

import { useMotionValue, useSpring } from "framer-motion";
import { debounce } from "lodash";
import { RefObject, useEffect, useRef, useState } from "react";
import { StoreApi, useStore } from "zustand";
import { GridStore } from "./clientState";
import { Direction, maskScrollArea } from "./clientUtils";
import { SchemaStores } from "./fetchData";

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
  const setDimensions = useStore(store).setDimensions;
  const handleResize = debounce(
    () => {
      setDimensions();
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
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize, initialLoad]);
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
  spring?: boolean
) => {
  const [offset, setOffset] = useState(0);

  // A spring that will control the "bounce-back" effect
  const bounceSpring = useSpring(offset, {
    stiffness: 200,
    damping: 10,
  });

  const handleScroll: EventListener = (ev) => {
    console.log(ev.target, ref.current);
    if (ref.current) {
      const scrollTop = ref.current.scrollTop;
      const maxScroll = ref.current.scrollHeight - ref.current.clientHeight;
      const percent = scrollTop / maxScroll;
      maskScrollArea(direction, ref.current as HTMLElement, percent, 10);
      if (!spring) return;

      // If the user scrolls beyond the top or bottom boundaries
      if (scrollTop < 0) {
        setOffset(-scrollTop); // Set offset to create bounce-back effect
      } else if (scrollTop > maxScroll) {
        setOffset(maxScroll - scrollTop);
      } else {
        setOffset(0); // Reset offset when within bounds
      }
      console.log(offset, scrollTop);
    }
  };

  useEffect(() => {
    maskScrollArea(direction, ref.current as HTMLElement, 0, 10);

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
  callback: Function
) => {
  useEffect(() => {
    const listener = (event: any) => {
      if (!ref.current || ref.current.contains(event.target)) {
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
        const canvas = document.createElement("canvas");
        const context =
          canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        return !!(window.WebGLRenderingContext && context);
      } catch (e) {
        console.error(e);
        console.log("FUCK");
        return false;
      }
    };

    // Perform the check and cache the result
    const support = checkWebGL();
    setIsWebGLSupported(support);
    cachedWebGLSupport = support;
  }, []);

  return isWebGLSupported;
};
