/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { GridContext } from "@/lib/clientState";
import { isWebGLSupported } from "@/lib/clientUtils";
import { useScrollMask } from "@/lib/hooks";
import { ScrollArea } from "@radix-ui/themes";
import { AnimatePresence, m, useScroll } from "framer-motion";
import { useCallback, useContext, useRef, useState } from "react";
import { useStore } from "zustand";
import { TracingBeam } from "../Aceternity/TracingBeam";
import GridBackdrop from "../Backdrop";
import { CARD_TYPES } from "../Cards/types";
import { GridCard } from "./card";
import { GridElement, GridElements } from "./consts";
import { initializeGridElements } from "./util";

const MScrollArea = m(ScrollArea);

const Grid = () => {
  const webgl = isWebGLSupported();
  const gridStore = useContext(GridContext)!;
  const { setDimensions, initialCards } = gridStore.getInitialState();
  const { activeCard, gridInfo, dimensions } = useStore(gridStore);
  const gridInfoRef = useRef(gridInfo);
  const dimensionsRef = useRef(dimensions);
  const [lowestElem, setLowestElem] = useState<GridElement>();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridElements, setGridElements] = useState<GridElements>(() => {
    console.log({ initialCards })
    const elemMap = initializeGridElements(gridInfo, initialCards, webgl);
    elemMap.delete(CARD_TYPES.Location);
    const lowestElem = [...elemMap.values()].reduce((acc, curr) =>
      acc.height + acc.coords[1] > curr.height + curr.coords[1] ? acc : curr);
    setLowestElem(lowestElem);
    return elemMap;
  });

  const { scrollYProgress, scrollY } = useScroll({
    container: scrollAreaRef,
  });

  const y = useScrollMask(scrollAreaRef, "bottom", true);

  const Card = useCallback((props: { gridElement: GridElement }) => {
    const { gridElement } = props;
    return <GridCard gridElement={gridElement} />;
  }, []);

  console.log({ dimensions, activeCard })

  return (
    <m.div
      ref={gridRef}
      id="grid"
      className="relative z-10 h-full container"
    >
      <ScrollArea
        className="h-full w-full"
        ref={scrollAreaRef}
        style={{
          height: activeCard ? dimensions.containerHeight : "90%",
        }}
      >
        <TracingBeam
          disableScroll
          scrollYProgress={scrollYProgress}
          height={0}
          offset={gridInfo.gridCellSize}
          initial={"initial"}
          variants={{
            initial: {
              transition: {
                staggerChildren: 0.8,
                opacity: [0, 1],
                transition: {
                  duration: 0.1,
                },
              },
            },
            expand: {},
          }}
        >
          <AnimatePresence>
            {Array.from(gridElements.values()).map((gridElement, index) => (
              <Card key={`${gridElement.id}`} gridElement={gridElement} />
            ))}
          </AnimatePresence>
          {webgl && <GridBackdrop scrollY={scrollY} />}
        </TracingBeam>
      </ScrollArea>
    </m.div>
  );
};

export default Grid;
