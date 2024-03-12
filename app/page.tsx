"use client";

import Backdrop from "@/components/Backdrop";
import Grid from "@/components/Grid";
import Overlay from "@/components/Overlay";
import { GridContext, useGridStore } from "@/lib/state";
import "@radix-ui/themes/styles.css";
import { debounce } from "lodash";
import { useCallback, useEffect, useRef } from "react";
import { useStore } from "zustand";

export default function Hero() {
  const store = useRef(useGridStore);
  const setDimensions = useStore(store.current).setDimensions;
  const getWindowDimensions = useCallback(() => {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height,
    };
  }, []);

  const handleResize = useCallback(
    debounce(() => setDimensions(getWindowDimensions()), 200, {
      trailing: true,
    }),
    [setDimensions, getWindowDimensions]
  );

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  return (
    <GridContext.Provider value={store.current}>
      <Overlay />
      <Backdrop />
      <Grid />
    </GridContext.Provider>
  );
}
