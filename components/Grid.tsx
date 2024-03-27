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
import ContactCard from "./Cards/ContactsCard";
import ExperienceCard from "./Cards/ExperienceCard";
import HeroCard from "./Cards/HeroCard";
import LocationCard from "./Cards/LocationCard";
import MenuCard from "./Cards/MenuCard";
import ProjectsCard from "./Cards/ProjectsCard";
import StatusCard from "./Cards/StatusCard";
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
  Home: HeroCard,
  Menu: MenuCard,
  Projects: ProjectsCard,
  Experience: ExperienceCard,
  Contacts: ContactCard,
  Location: LocationCard,
  Status: StatusCard,
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
        const { gridCellHeight, gridCellWidth, gridUnitHeight, gridUnitWidth } =
          gridInfo;
        const x = e.coords[0] * gridCellWidth,
          y = e.coords[1] * gridCellHeight,
          width = e.width * gridUnitWidth,
          height = e.height * gridUnitHeight;
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
      const { gridCellHeight, gridCellWidth, gridUnitWidth, gridUnitHeight } =
        gridInfo;
      ids.forEach((id) => {
        let elem = gridElements.get(id);
        if (elem) {
          if (!elem.isLocked) {
            elem.coords = [
              DEFAULT_COORDS[0] * gridCellWidth,
              DEFAULT_COORDS[1] * gridCellHeight,
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
              initElem.coords[0] * gridCellWidth,
              initElem.coords[1] * gridCellHeight,
            ],
            width: initElem.width * gridUnitWidth,
            height: initElem.height * gridUnitHeight,
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
    console.log("Grid");
  });

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
      const { gridUnitHeight, gridUnitWidth, bounds } = props.gridInfo;
      const MappedCard = cardMap[id];
      const dragTransition = {
        power: 0.08,
        min: 0,
        max: 100,
        restDelta: 5,
        modifyTarget: (v: number) => {
          const diagonal = Math.sqrt(gridUnitHeight ** 2 + gridUnitWidth ** 2);
          const roundedHeight = Math.round(v / gridUnitHeight) * gridUnitHeight;
          const roundedWidth = Math.round(v / gridUnitWidth) * gridUnitWidth;
          const roundedDiagonal = Math.round(v / diagonal) * diagonal;
          const distances = [roundedHeight, roundedWidth, roundedDiagonal];
          const closestDistance = distances.reduce((prev, curr) => {
            return Math.abs(curr - v) < Math.abs(prev - v) ? curr : prev;
          });
          return closestDistance;
        },
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
