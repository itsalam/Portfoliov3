"use client";

import { useLoading } from "@/app/providers";
import { useMotionValue } from "framer-motion";
import { debounce } from "lodash";
import { RefObject, UIEventHandler, useEffect } from "react";
import { StoreApi, useStore } from "zustand";
import { Direction, maskScrollArea } from "./clientUtils";
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

export const useScrollMask = (
  ref: RefObject<HTMLElement>,
  direction: Direction = "bottom"
) => {
  const handleScroll: UIEventHandler<HTMLDivElement> = (e) => {
    const h = e.target as HTMLElement;
    const st = h.scrollTop || document.body.scrollTop;
    const sh = h.scrollHeight || document.body.scrollHeight;
    const percent = st / (sh - h.clientHeight);
    maskScrollArea(direction, ref.current as HTMLElement, percent, 10);
  };

  useEffect(() => {
    maskScrollArea(direction, ref.current as HTMLElement, 0, 10);
  });

  return handleScroll;
};
