"use client";

import Canvas from "@/components/Canvases/ParticlesCanvas";
import { useWindowDimensions } from "@/lib/clientUtils";
import { gridAtom } from "@/lib/state";
import { useAtomValue } from "jotai";
import { useEffect } from "react";

const Page = () => {
  const grid = useAtomValue(gridAtom);
  useWindowDimensions();

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
