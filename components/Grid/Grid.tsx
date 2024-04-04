"use client";

import { GridContext, GridInfo } from "@/lib/state";
import {
  AnimatePresence,
  motion,
  useAnimate,
  useAnimation,
} from "framer-motion";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import GridBackdrop from "../Backdrop";
import { TitleCard } from "../Card";
import { CARD_TYPES } from "../Cards/types";
// import ScrollArea from "./ScrollArea";
import { ScrollArea } from "@radix-ui/themes";
import { debounce } from "lodash";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  DEFAULT_COORDS,
  DEFAULT_GRID_ELEMENTS,
  ELEMENT_MAP,
  GRID_QUERY_KEY,
} from "./consts";
import {
  GridElement,
  initializeGridElements,
  placeNewRect,
  resolveIntersections,
} from "./util";

const Grid = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const context = useContext(GridContext)!;
  const { addListener, setDimensions } = context.getInitialState();
  const { gridInfo, dimensions } = useStore(context);
  const [ref, animate] = useAnimate<HTMLDivElement>();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const gridInfoRef = useRef(gridInfo);
  const dimensionsRef = useRef(dimensions);
  const [lowestElem, setLowestElem] = useState<GridElement>();
  const [gridElements, setGridElements] = useState<
    Map<CARD_TYPES, GridElement>
  >(initializeGridElements(gridInfo, searchParams));

  const createQueryString = useCallback(
    (name: string, value: string, searchParams: ReadonlyURLSearchParams) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    []
  );

  const animation = useAnimation();

  const scrollToGridElement = debounce(
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
    50
  );

  const pushElements = useCallback(
    (gridInfo: GridInfo, gridElements: Map<CARD_TYPES, GridElement>) =>
      (ids: CARD_TYPES[]) => {
        const { gridUnitSize, gridCellSize } = gridInfo;
        ids.forEach((id) => {
          let gridElem = gridElements.get(id);
          if (gridElem) {
            if (!gridElem.isLocked) {
              gridElem.coords = [
                DEFAULT_COORDS[0] * gridUnitSize,
                DEFAULT_COORDS[1] * gridUnitSize,
              ];
            }
            gridElem = placeNewRect(gridElem, gridElements, gridInfo);
            gridElements.set(id, { ...gridElem, hasPositioned: true });
            resolveIntersections(gridElem, gridElements, gridInfo, true);
            scrollToGridElement(gridElem);
          } else {
            const initElem = DEFAULT_GRID_ELEMENTS[id];
            gridElements.set(id, {
              ...initElem,
              coords: [
                initElem.coords[0] * gridUnitSize,
                initElem.coords[1] * gridUnitSize,
              ],
              width: initElem.width * gridCellSize,
              height: initElem.height * gridCellSize,
            });
          }
        });
        setGridElements(new Map(gridElements));
      },
    []
  );

  const lockElements =
    (gridElements: Map<CARD_TYPES, GridElement>) => (ids: CARD_TYPES[]) => {
      ids.forEach((id) => {
        const elem = gridElements.get(id);
        if (elem) {
          gridElements.set(id, { ...elem, isLocked: !elem.isLocked });
        }
      });
      setGridElements(new Map(gridElements));
    };

  const closeElements =
    (gridElements: Map<CARD_TYPES, GridElement>) => (ids: CARD_TYPES[]) => {
      ids.forEach((id) => {
        const elem = gridElements.get(id);
        if (elem) {
          gridElements.delete(id);
        }
      });
      setGridElements(new Map(gridElements));
    };

  useEffect(() => {
    const gridInfo = gridInfoRef.current;
    const removeListener = addListener({
      dispatch: setGridElements,
      pushElements: pushElements(gridInfo, gridElements),
      lockElements: lockElements(gridElements),
      closeElements: closeElements(gridElements),
    });
    return () => removeListener();
  }, [addListener, gridElements, pushElements]);

  useEffect(() => {
    const queryStr = gridElements.size
      ? createQueryString(
          GRID_QUERY_KEY,
          [...gridElements.keys()].join(","),
          searchParams
        )
      : "";
    router.push(pathname + "?" + queryStr);
  }, [createQueryString, gridElements, pathname, router, searchParams]);

  useEffect(() => {
    const gridInfo = gridInfoRef.current;
    const elemArrs = Array.from(gridElements.values());
    const unPositionedElements = elemArrs.filter((e) => !e.hasPositioned);
    //check for new rects by checking unPoistionedRects
    if (elemArrs.length) {
      // Update locked rects positions, possibly redo by moving the ondrag listener to here
      elemArrs
        .filter((e) => e.isLocked)
        .forEach((e) => {
          const transform = (document.querySelector(`#${e.id}`) as HTMLElement)
            ?.style?.transform;
          if (transform) {
            let translateX = 0;
            let translateY = 0;

            // Extracting translate values from the transform string

            const matches = transform.match(/-?\d+\.?\d*px/g);
            if (matches) {
              translateX = parseFloat(matches[0]);
              translateY = parseFloat(matches[1]);
            }

            e.coords = [translateX, translateY];
            gridElements.set(e.id, e);
          }
        });
      const newRects = unPositionedElements.map((e) => {
        const newGridElem = placeNewRect(e, gridElements, gridInfo);
        resolveIntersections(newGridElem, gridElements, gridInfo);
        gridElements.set(newGridElem.id, newGridElem);
        return newGridElem;
      });
      // const closingElems = Array.from(gridElements.values())
      //   .filter((e) => !elementInBounds(e, gridInfo))
      //   .map(({ id }) => id);

      if (newRects.length) {
        newRects.forEach((e) =>
          gridElements.set(e.id, { ...e, hasPositioned: true })
        );
        setGridElements(new Map(gridElements));
      }
      const lowestElem = elemArrs.reduce((acc, curr) =>
        acc.height + acc.coords[1] > curr.height + curr.coords[1] ? acc : curr
      );
      setLowestElem(lowestElem);
    }
  }, [gridElements, animate, animation]);

  useEffect(() => {
    const gridInfo = gridInfoRef.current;
    const dimensions = dimensionsRef.current;
    if (lowestElem) {
      const lowestElemHeight = lowestElem.height + lowestElem.coords[1];
      if (lowestElemHeight > dimensions.height) {
        setDimensions({
          containerHeight: Math.max(
            dimensionsRef.current.height,
            lowestElem.height + lowestElem.coords[1] + gridInfo.gridCellSize
          ),
        });
        scrollToGridElement(lowestElem);
      }
    }
  }, [lowestElem, setDimensions]);

  const GCard = useCallback(
    (props: { gridElement: GridElement; gridInfo: GridInfo }) => {
      const { id, coords, width, height, isLocked } = props.gridElement;
      const { gridUnitSize, bounds } = props.gridInfo;
      const CardContent = ELEMENT_MAP[id];
      const dragTransition = {
        power: 0.08,
        min: 0,
        max: 40,
        restDelta: 20,
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
          dragElastic={0.3}
          key={id}
          id={id}
          dragTransition={dragTransition}
          x={coords[0]}
          y={coords[1]}
          isLocked={isLocked}
        >
          <CardContent />
        </TitleCard>
      );
    },
    []
  );

  return (
    <motion.div
      ref={ref}
      id="grid"
      className="relative z-10 h-full w-full overflow-scroll"
      animate={animation}
    >
      <ScrollArea ref={scrollAreaRef}>
        <motion.div
          className="relative h-full w-full"
          style={{
            height: dimensions.containerHeight,
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
          <GridBackdrop scrollAreaRef={scrollAreaRef} />
        </motion.div>
      </ScrollArea>
    </motion.div>
  );
};

export default Grid;
