/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { GridContext } from "@/lib/state";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { useContext, useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import GridBackdrop from "../Backdrop";
// import ScrollArea from "./ScrollArea";
import { ScrollArea } from "@radix-ui/themes";
import { useSearchParams } from "next/navigation";
import { TracingBeam } from "../Aceternity/TracingBeam";
import { CARD_TYPES } from "../Cards/types";
import { useActions } from "./actions";
import { GridCard } from "./card";
import {
  DRAG_TIMEOUT,
  GridElement,
  GridElements,
  SCROLL_TO_CARD_DELAY,
} from "./consts";
import {
  initializeGridElements,
  resolveIntersections,
  updateDraggedElement,
  useNavigation,
} from "./util";

const MScrollArea = motion(ScrollArea);

const Grid = () => {
  const searchParams = useSearchParams();
  const context = useContext(GridContext)!;
  const { setDimensions } = context.getInitialState();
  const { gridInfo, dimensions } = useStore(context);
  const store = useContext(GridContext)!;
  const { activeCard } = useStore(store);
  const gridInfoRef = useRef(gridInfo);
  const dimensionsRef = useRef(dimensions);
  const [lowestElem, setLowestElem] = useState<GridElement>();
  const [gridElements, setGridElements] = useState<GridElements>(() => {
    const elemMap = initializeGridElements(gridInfo, searchParams);
    const lowestElem = [...elemMap.values()].reduce((acc, curr) =>
      acc.height + acc.coords[1] > curr.height + curr.coords[1] ? acc : curr
    );
    setLowestElem(lowestElem);
    return elemMap;
  });

  const { adjustElements, gridRef, scrollToGridElement, scrollAreaRef } =
    useActions(context, gridElements, setGridElements, gridInfoRef);

  useNavigation(searchParams, gridElements);

  const { scrollYProgress, scrollY } = useScroll({
    container: scrollAreaRef,
    // offset: ["start start", "end start"],
  });

  useEffect(() => {
    const { gridUnitSize, oldVals } = gridInfo;
    if (oldVals && oldVals.gridUnitSize !== gridUnitSize) {
      adjustElements(gridInfo);
    }
    gridInfoRef.current = gridInfo;
  }, [gridInfo]);

  useEffect(() => {
    const gridInfo = gridInfoRef.current;
    const elemArr = Array.from(gridElements.values());
    const unPositionedElements = elemArr.filter((e) => !e.hasPositioned);
    if (unPositionedElements.length) {
      unPositionedElements.forEach((e) => {
        const newGridElem = resolveIntersections(e, gridElements, gridInfo);
        gridElements.set(newGridElem.id, newGridElem);
      });
      setGridElements(new Map(gridElements));
      const closestNewElem = unPositionedElements.reduce((acc, curr) =>
        acc.height + acc.coords[1] < curr.height + curr.coords[1] ? acc : curr
      );
      scrollToGridElement(closestNewElem);
    }

    const lowestElem = elemArr.length
      ? elemArr.reduce((acc, curr) =>
          acc.height + acc.coords[1] > curr.height + curr.coords[1] ? acc : curr
        )
      : undefined;
    setLowestElem(lowestElem);
  }, [gridElements, scrollToGridElement]);

  useEffect(() => {
    const gridInfo = gridInfoRef.current;
    const dimensions = dimensionsRef.current;
    if (lowestElem) {
      const lowestElemHeight = lowestElem.height + lowestElem.coords[1];
      if (lowestElemHeight > dimensions.height) {
        setDimensions({
          containerHeight: Math.max(
            dimensions.height,
            lowestElem.height +
              lowestElem.coords[1] +
              Math.max(64, gridInfo.gridCellSize * 1)
          ),
        });
      } else if (lowestElemHeight < dimensions.height) {
        setDimensions({
          containerHeight: dimensions.height,
        });
      }
    }
  }, [lowestElem, setDimensions]);

  useEffect(() => {
    const themeElement = document.getElementById("theme");
    if (activeCard && activeCard !== CARD_TYPES.Home && themeElement) {
      themeElement.classList.add("focus");
    } else if (themeElement) {
      themeElement.classList.remove("focus");
    }
  }, [activeCard]);

  return (
    <motion.div
      ref={gridRef}
      id="grid"
      className="container relative z-10 h-full"
    >
      <MScrollArea
        className="h-full w-full"
        ref={scrollAreaRef}
        animate={{
          height: activeCard ? dimensions.containerHeight : dimensions.height,
        }}
        style={{
          height: activeCard ? dimensions.containerHeight : dimensions.height,
        }}
        transition={{
          duration: 0.5,
        }}
      >
        <TracingBeam
          scrollYProgress={scrollYProgress}
          height={dimensions.containerHeight}
          transition={{
            duration: (SCROLL_TO_CARD_DELAY * 0.5) / 1000,
          }}
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
            {[...gridElements.values()].map((gridElement) => {
              return (
                <GridCard
                  dimensions={dimensions}
                  key={gridElement.id}
                  gridElement={gridElement}
                  gridInfo={gridInfo}
                  activeCard={activeCard}
                  onDragEnd={(e, i) =>
                    setTimeout(() => {
                      console.log(e, i);
                      updateDraggedElement(gridElement.id, gridElements);
                    }, DRAG_TIMEOUT * 1.1)
                  }
                />
              );
            })}
          </AnimatePresence>
          <GridBackdrop scrollY={scrollY} />
        </TracingBeam>
      </MScrollArea>
    </motion.div>
  );
};

export default Grid;
