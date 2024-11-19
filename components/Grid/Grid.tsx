/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useScrollMask } from "@/lib/hooks";
import { GridContext } from "@/lib/providers/clientState";
import { isWebGLSupported } from "@/lib/providers/clientUtils";
import { ScrollArea } from "@radix-ui/themes";
import { AnimatePresence, m, useScroll } from "framer-motion";
import { useCallback, useContext } from "react";
import { useStore } from "zustand";
import GridBackdrop from "../Backdrop";
import { useGrid } from "./actions";
import { GridElement } from "./consts";
import { GridCard } from "./GridCard";

const Grid = () => {
  const webgl = isWebGLSupported();
  const gridStore = useContext(GridContext)!;
  const { activeCard, dimensions } = useStore(gridStore);
  const { gridElements, scrollAreaRef } = useGrid(gridStore);

  const { scrollY } = useScroll({
    container: scrollAreaRef,
  });

  useScrollMask(scrollAreaRef, "bottom", true);

  const Card = useCallback((props: { gridElement: GridElement }) => {
    const { gridElement } = props;
    return <GridCard gridElement={gridElement} />;
  }, []);

  const Cards = useCallback(
    ({ gridElements }: { gridElements: Map<string, GridElement> }) => (
      <AnimatePresence>
        {Array.from(gridElements.values()).map((gridElement) => (
          <Card key={`${gridElement.id}`} gridElement={gridElement} />
        ))}
      </AnimatePresence>
    ),
    []
  );

  return (
    <m.div
      id="grid"
      className="relative z-10 h-full container"
    >
      <ScrollArea
        className="h-full w-full overflow-hidden"
        ref={scrollAreaRef}
        style={{
          height: activeCard ? dimensions.height : "90%",
        }}
      >
        <div
          style={{
            position: activeCard ? "initial" : "relative",
          }}
        >
          <Cards gridElements={gridElements} />
        </div>
        {webgl && <GridBackdrop scrollY={scrollY} />}
      </ScrollArea>
    </m.div>
  );
};

export default Grid;
