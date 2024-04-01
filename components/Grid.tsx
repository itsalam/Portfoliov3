"use client";

import {
  DEFAULT_COORDS,
  DEFAULT_GRID_ELEMENTS,
  GridContext,
  GridInfo,
} from "@/lib/state";
import "@radix-ui/themes/styles.css";
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
  useState,
} from "react";
import { useStore } from "zustand";
import GridBackdrop from "./Backdrop";
import Card from "./Card";
import { CARD_TYPES } from "./Cards/types";
import {
  GridElement,
  elementInBounds,
  placeNewRect,
  resolveIntersections,
} from "./util/gridUtil";

const cardMap: Record<
  CARD_TYPES,
  ComponentType<ComponentProps<typeof Card>>
> = {
  Home: dynamic(() => import("./Cards/HeroCard")),
  Menu: dynamic(() => import("./Cards/MenuCard")),
  Projects: dynamic(() => import("./Cards/ProjectsCard")),
  Experience: dynamic(() => import("./Cards/ExperienceCard")),
  Contacts: dynamic(() => import("./Cards/ContactsCard")),
  Location: dynamic(() => import("./Cards/LocationCard")),
  Status: dynamic(() => import("./Cards/StatusCard")),
  Resume: dynamic(() => import("./Cards/ResumeCard")),
};

const Grid = () => {
  const context = useContext(GridContext)!;
  const [ref, animate] = useAnimate<HTMLDivElement>();
  const animation = useAnimation();
  const { initElements, addListener } = context.getInitialState();
  const { gridInfo } = useStore(context);
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

  const pushElements =
    (gridInfo: GridInfo, gridElements: Map<CARD_TYPES, GridElement>) =>
    (ids: CARD_TYPES[]) => {
      const { gridUnitSize, gridCellSize } = gridInfo;
      ids.forEach((id) => {
        let elem = gridElements.get(id);
        if (elem) {
          if (!elem.isLocked) {
            elem.coords = [
              DEFAULT_COORDS[0] * gridUnitSize,
              DEFAULT_COORDS[1] * gridUnitSize,
            ];
          }
          elem = placeNewRect(elem, gridElements, gridInfo);
          gridElements.set(id, { ...elem, hasPositioned: true });
          resolveIntersections(elem, gridElements, gridInfo, true);
          setGridElements(new Map(gridElements));
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
        setGridElements(new Map(gridElements));
      });
    };

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
    const removeListener = addListener({
      dispatch: setGridElements,
      pushElements: pushElements(gridInfo, gridElements),
      lockElements: lockElements(gridElements),
      closeElements: closeElements(gridElements),
    });
    return () => removeListener();
  }, [addListener, gridInfo, gridElements]);

  useEffect(() => {
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
      const closingElems = Array.from(gridElements.values())
        .filter((e) => !elementInBounds(e, gridInfo))
        .map(({ id }) => id);

      if (newRects.length) {
        newRects.forEach((e) =>
          gridElements.set(e.id, { ...e, hasPositioned: true })
        );
        setGridElements(new Map(gridElements));
      }
      // });
    }
  }, [gridElements, animate, animation, gridInfo]);

  const GCard = useCallback(
    (props: { gridElement: GridElement; gridInfo: GridInfo }) => {
      const { id, coords, width, height, isLocked } = props.gridElement;
      const { gridCellSize, bounds } = props.gridInfo;
      const MappedCard = cardMap[id];
      const dragTransition = {
        power: 0.08,
        min: 0,
        max: 100,
        restDelta: 5,
        modifyTarget: (target: number) =>
          Math.round(target / gridCellSize) * gridCellSize,
      };

      return (
        <MappedCard
          dragConstraints={{
            ...bounds,
            right: gridInfo.bounds.right - width,
            bottom: gridInfo.bounds.bottom - height,
          }}
          width={width}
          height={height}
          dragElastic={0.3}
          key={id}
          id={id}
          dragTransition={dragTransition}
          animate={{
            x: [null, coords[0]],
            y: [null, coords[1]],
            transition: {
              duration: 0.1,
            },
          }}
          isLocked={isLocked}
          exit={{
            opacity: 0,
            width: 0,
            height: 0,
          }}
        />
      );
    },
    []
  );

  return (
    <motion.div
      ref={ref}
      id="grid"
      className="relative z-10 h-full w-full overflow-visible"
      animate={animation}
    >
      <AnimatePresence>
        {[...gridElements.values()]
          .filter((e) => e.hasPositioned)
          .map((gridElement) => {
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
  );
};

export default Grid;
