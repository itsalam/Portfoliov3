"use client";

import { GridContext, GridInfo } from "@/lib/state";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
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
import { ELEMENT_MAP, GRID_QUERY_KEY, GridElements } from "./consts";
import {
  GridElement,
  binpackElements,
  getDefaultGridElement,
  initializeGridElements,
  resolveIntersections,
  updateDraggedElement,
} from "./util";

const DRAG_TIMEOUT = 100;

const Grid = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const context = useContext(GridContext)!;
  const { addListener, setDimensions } = context.getInitialState();
  const { gridInfo, dimensions } = useStore(context);
  const gridRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
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

  const createQueryString = useCallback(
    (name: string, value: string, searchParams: ReadonlyURLSearchParams) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    []
  );

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
      100,
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
          console.log("push");
          gridElements.set(id, getDefaultGridElement(id, gridInfo));

          console.log("push ended");
          console.log(JSON.parse(JSON.stringify([...gridElements.values()])));
          setGridElements(new Map(gridElements));
        }
      });
    },
    [scrollToGridElement]
  );

  const lockElements = (gridElements: GridElements) => (ids: CARD_TYPES[]) => {
    ids.forEach((id) => {
      const elem = gridElements.get(id);
      if (elem) {
        gridElements.set(id, { ...elem, isLocked: !elem.isLocked });
      }
    });
    setGridElements(new Map(gridElements));
  };

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
    const { gridUnitSize, oldVals } = gridInfo;
    if (oldVals && oldVals.gridUnitSize !== gridUnitSize) {
      console.log("binpack");
      setGridElements((gridElements: GridElements) => {
        gridElements.forEach((element) => {
          const { width, height, coords } = getDefaultGridElement(
            element.id,
            gridInfo
          );
          gridElements.set(element.id, {
            ...element,
            coords,
            hasPositioned: false,
            width,
            height,
          });
        });
        binpackElements(gridElements, gridInfo);
        return new Map(gridElements);
      });
    }
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
  }, [createQueryString, gridElements, pathname, router, searchParams]);

  useEffect(() => {
    const gridInfo = gridInfoRef.current;
    const elemArr = Array.from(gridElements.values());
    const unPositionedElements = elemArr.filter((e) => !e.hasPositioned);
    if (unPositionedElements.length) {
      unPositionedElements.forEach((e) => {
        const newGridElem = resolveIntersections(e, gridElements, gridInfo);
        gridElements.set(newGridElem.id, newGridElem);
      });

      console.log("gridelems");
      setGridElements(new Map(gridElements));
      const lowestElem = elemArr.reduce((acc, curr) =>
        acc.height + acc.coords[1] > curr.height + curr.coords[1] ? acc : curr
      );
      setLowestElem(lowestElem);
    }
  }, [gridElements]);

  useEffect(() => {
    const gridInfo = gridInfoRef.current;
    const dimensions = dimensionsRef.current;
    if (lowestElem) {
      const lowestElemHeight = lowestElem.height + lowestElem.coords[1];
      if (lowestElemHeight > dimensions.height) {
        setDimensions({
          containerHeight: Math.max(
            dimensions.height,
            lowestElem.height + lowestElem.coords[1] + gridInfo.gridCellSize
          ),
        });
        scrollToGridElement(lowestElem);
      } else if (lowestElemHeight < dimensions.height) {
        setDimensions({
          containerHeight: dimensions.height,
        });
      }
    }
  }, [lowestElem, scrollToGridElement, setDimensions]);

  const GCard = useCallback(
    (props: { gridElement: GridElement; gridInfo: GridInfo }) => {
      const { id, coords, width, height, isLocked } = props.gridElement;
      const { gridUnitSize, bounds } = props.gridInfo;
      const CardContent = ELEMENT_MAP[id];
      const dragTransition: ComponentProps<typeof TitleCard>["dragTransition"] =
        {
          max: 10,
          power: 0,
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
          isLocked={isLocked}
          onDragEnd={() =>
            setTimeout(
              () => updateDraggedElement(id, gridElements),
              DRAG_TIMEOUT * 1.1
            )
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
      className="relative z-10 h-full w-full overflow-scroll"
      animate={animation}
    >
      <ScrollArea ref={scrollAreaRef}>
        <motion.div
          className="relative h-full w-full"
          animate={{
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
