"use client";

import {
  DEFAULT_COORDS,
  DEFAULT_GRID_ELEMENTS,
  GridContext,
  GridInfo,
} from "@/lib/state";
import {
  AnimatePresence,
  motion,
  useAnimate,
  useAnimation,
} from "framer-motion";
import dynamic from "next/dynamic";
import {
  ComponentProps,
  ComponentType,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useStore } from "zustand";
import GridBackdrop from "./Backdrop";
import Card, { TitleCard } from "./Card";
import LoadingCard from "./Cards/LoadingCard";
import { CARD_TYPES } from "./Cards/types";
// import ScrollArea from "./ScrollArea";
import { ScrollArea } from "@radix-ui/themes";
import { debounce } from "lodash";
import {
  GridElement,
  placeNewRect,
  resolveIntersections,
} from "./util/gridUtil";

const cardMap: Record<
  CARD_TYPES,
  ComponentType<ComponentProps<typeof Card>>
> = {
  Home: dynamic(() => import("./Cards/HeroCard"), {
    loading: (props) => <LoadingCard {...props} />,
    ssr: false,
  }),
  Menu: dynamic(() => import("./Cards/MenuCard"), {
    loading: (props) => <LoadingCard {...props} />,
    ssr: false,
  }),
  Projects: dynamic(() => import("./Cards/ProjectsCard"), {
    loading: (props) => <LoadingCard {...props} />,
    ssr: false,
  }),
  Experience: dynamic(() => import("./Cards/ExperienceCard"), {
    loading: (props) => <LoadingCard {...props} />,
    ssr: false,
  }),
  Contacts: dynamic(() => import("./Cards/ContactsCard"), {
    loading: (props) => <LoadingCard {...props} />,
    ssr: false,
  }),
  Location: dynamic(() => import("./Cards/LocationCard"), {
    loading: (props) => <LoadingCard {...props} />,
    ssr: false,
  }),
  Status: dynamic(() => import("./Cards/StatusCard"), {
    loading: (props) => <LoadingCard {...props} />,
    ssr: false,
  }),
  Resume: dynamic(() => import("./Cards/ResumeCard"), {
    loading: (props) => <LoadingCard {...props} />,
    ssr: false,
  }),
};

// const cardMap: Record<
//   CARD_TYPES,
//   ComponentType<ComponentProps<typeof Card>>
// > = {
//   Home: HeroCard,
//   Menu: MenuCard,
//   Projects: ProjectsCard,
//   Experience: ExperienceCard,
//   Contacts: ContactCard,
//   Location: LocationCard,
//   Status: StatusCard,
//   Resume: ResumeCard,
// };

const Grid = () => {
  const context = useContext(GridContext)!;
  const { initElements, addListener, setDimensions } =
    context.getInitialState();
  const { gridInfo, dimensions } = useStore(context);
  const [ref, animate] = useAnimate<HTMLDivElement>();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const gridInfoRef = useRef(gridInfo);
  const dimensionsRef = useRef(dimensions);
  const [lowestElem, setLowestElem] = useState<GridElement>();
  const [gridElements, setGridElements] = useState<
    Map<CARD_TYPES, GridElement>
  >(
    new Map<CARD_TYPES, GridElement>(
      initElements.map((e) => {
        const { gridUnitSize, gridCellSize } = gridInfo;
        const x = e.coords[0] * gridUnitSize,
          y = e.coords[1] * gridUnitSize,
          width = e.width * gridCellSize,
          height = e.height * gridCellSize;
        return [
          e.id,
          {
            ...e,
            coords: [x, y],
            hasPositioned: true,
            width,
            height,
          },
        ] as [CARD_TYPES, GridElement];
      })
    )
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
    }
    if (elemArrs.length) {
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
      const CardContent = cardMap[id];
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
          <GridBackdrop gridInfo={gridInfo} />
        </motion.div>
      </ScrollArea>
    </motion.div>
  );
};

export default Grid;
