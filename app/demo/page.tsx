"use client";

import Canvas from "@/components/Canvases/ParticlesCanvas";
import { useWindowDimensions } from "@/lib/clientUtils";
import { dimensionAtom, gridAtom } from "@/lib/state";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

const Page = () => {
  const setDimensions = useSetAtom(dimensionAtom);
  const grid = useAtomValue(gridAtom);
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    setDimensions({ width, height });
  }, [width, height, setDimensions]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--grid-width", `${grid.gridUnitWidth}px`);
    root.style.setProperty("--grid-height", `${grid.gridUnitHeight}px`);
    root.style.setProperty("--x-padding", `${grid.gapSize / 4}px`);
    root.style.setProperty("--y-padding", `${grid.gapSize / 4}px`);
  }, [grid]);

  return <Canvas />;
};

export default Page;
