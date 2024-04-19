/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { GridContext, GridInfo } from "@/lib/state";
import {
  AnimatePresence,
  motion,
  useAnimation,
  useScroll,
} from "framer-motion";
import {
  ComponentProps,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useStore } from "zustand";
import GridBackdrop from "../Backdrop";
import { TitleCard } from "../Cards/BaseCard";
import { CARD_TYPES } from "../Cards/types";
// import ScrollArea from "./ScrollArea";
import { useScrollMask } from "@/lib/hooks";
import { ScrollArea } from "@radix-ui/themes";
import { debounce } from "lodash";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TracingBeam } from "../Aceternity/TracingBeam";
import { ELEMENT_MAP, GRID_QUERY_KEY, GridElements } from "./consts";
import {
  GridElement,
  binpackElements,
  createQueryString,
  getDefaultGridElement,
  initializeGridElements,
  resolveIntersections,
  updateDraggedElement,
} from "./util";

const DRAG_TIMEOUT = 500;
const SCROLL_TO_CARD_DELAY = 500;

const Grid = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const context = useContext(GridContext)!;
  const { addListener, setDimensions } = context.getInitialState();
  const { gridInfo, dimensions } = useStore(context);
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const onScroll = useScrollMask(scrollAreaRef);
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

  const { scrollYProgress, scrollY } = useScroll({
    container: scrollAreaRef,
    // offset: ["start start", "end start"],
  });

  const animation = useAnimation();

  const scrollToGridElement = useCallback(
    debounce(
      (gridElement: GridElement, delay = 100) => {
        setTimeout(() => {
          scrollAreaRef.current?.scrollTo({
            top: Math.max(
              0,
              gridElement.coords[1] - gridInfoRef.current.gridUnitSize
            ),
            behavior: "smooth",
          });
        }, delay);
      },
      SCROLL_TO_CARD_DELAY,
      { trailing: true }
    ),
    []
  );

  const pushElements = useCallback(
    (gridInfo: GridInfo, gridElements: GridElements) => (ids: CARD_TYPES[]) => {
      ids.forEach((id) => {
        const gridElem = gridElements.get(id);
        if (gridElem) {
          // binpackElements(gridElements, gridInfo);
          scrollToGridElement(gridElem);
        } else {
          gridElements.set(id, getDefaultGridElement(id, gridInfo));
          setGridElements(new Map(gridElements));
        }
      });
    },
    [scrollToGridElement]
  );

  const closeElements = (gridElements: GridElements) => (ids: CARD_TYPES[]) => {
    ids.forEach((id) => {
      const elem = gridElements.get(id);
      if (elem) {
        gridElements.delete(id);
      }
    });
    setGridElements(new Map(gridElements));
    if (gridElements.size) {
      const lowestElem = [...gridElements.values()].reduce((acc, curr) =>
        acc.height + acc.coords[1] > curr.height + curr.coords[1] ? acc : curr
      );
      setLowestElem(lowestElem);
    }
    binpackElements(gridElements, gridInfoRef.current);
  };

  useEffect(() => {
    const gridInfo = gridInfoRef.current;
    const removeListener = addListener({
      dispatch: setGridElements,
      pushElements: pushElements(gridInfo, gridElements),
      closeElements: closeElements(gridElements),
    });
    return () => removeListener();
  }, [addListener, gridElements, pushElements]);

  const adjustElements = useCallback(
    debounce(
      (gridInfo) => {
        setGridElements((gridElements: GridElements) => {
          const newGridElements = new Map(gridElements); // Clone to ensure immutability
          newGridElements.forEach((element) => {
            const { width, height, coords } = getDefaultGridElement(
              element.id,
              gridInfo
            );
            newGridElements.set(element.id, {
              ...element,
              coords,
              hasPositioned: false,
              width,
              height,
            });
          });
          binpackElements(newGridElements, gridInfo);
          return newGridElements;
        });
      },
      200,
      { trailing: true }
    ),
    []
  );

  useEffect(() => {
    const { gridUnitSize, oldVals } = gridInfo;
    if (oldVals && oldVals.gridUnitSize !== gridUnitSize) {
      adjustElements(gridInfo);
    }
    gridInfoRef.current = gridInfo;
  }, [gridInfo]);

  useEffect(() => {
    const queryStr = gridElements.size
      ? createQueryString(
          GRID_QUERY_KEY,
          [...gridElements.keys()].join(","),
          searchParams
        )
      : "";
    router.push(pathname + "?" + queryStr);
  }, [gridElements, pathname, router, searchParams]);

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

  const GCard = useCallback(
    (props: { gridElement: GridElement; gridInfo: GridInfo }) => {
      const { id, coords, width, height } = props.gridElement;
      const { gridUnitSize, bounds, isMobile } = props.gridInfo;
      const CardContent = ELEMENT_MAP[id];
      const dragTransition: ComponentProps<typeof TitleCard>["dragTransition"] =
        {
          max: 3,
          power: 0.2,
          timeConstant: DRAG_TIMEOUT,
          modifyTarget: (target: number) =>
            Math.round(target / gridUnitSize) * gridUnitSize,
        };
      return (
        <TitleCard
          title={id}
          dragConstraints={{
            ...bounds,
            right: bounds.right - width,
            bottom: bounds.bottom - height,
          }}
          exit={"exit"}
          width={width}
          height={height}
          dragElastic={0.1}
          key={id}
          id={id}
          dragTransition={dragTransition}
          x={coords[0]}
          y={coords[1]}
          drag={!isMobile}
          onDragEnd={(e, i) =>
            setTimeout(() => {
              console.log(e, i);
              updateDraggedElement(id, gridElements);
            }, DRAG_TIMEOUT * 1.1)
          }
        >
          <CardContent />
        </TitleCard>
      );
    },
    []
  );

  return (
    <motion.div
      ref={gridRef}
      id="grid"
      className="container relative z-10 h-full"
      animate={animation}
    >
      <ScrollArea
        className="h-full w-full"
        ref={scrollAreaRef}
        onScroll={onScroll}
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
              },
            },
          }}
        >
          <AnimatePresence>
            {[...gridElements.values()].map((gridElement) => {
              return (
                <GCard
                  key={gridElement.id}
                  gridElement={gridElement}
                  gridInfo={gridInfo}
                />
              );
            })}
          </AnimatePresence>
          <GridBackdrop scrollY={scrollY} />
        </TracingBeam>
      </ScrollArea>
    </motion.div>
  );
};

export default Grid;
