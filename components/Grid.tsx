"use client";

import { GridContext } from "@/lib/state";
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
  useContext,
  useEffect,
  useMemo,
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
  moveDisplacedRects,
  placeUnpositionedRect,
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

  useEffect(() => {
    const removeListener = addListener(setGridElements);
    return () => removeListener();
  }, [addListener]);

  useEffect(() => {
    const elemArrs = Array.from(gridElements.values());
    const unPositionedElements = elemArrs.filter((e) => !e.hasPositioned);

    //check for new rects by checking unPoistionedRects
    if (unPositionedElements.length) {
      // Update locked rects positions, possibly redo by moving the ondrag listener to here
      elemArrs
        .filter((e) => e.isLocked)
        .forEach((e) => {
          const domRect = document
            .querySelector(`#${e.id}`)
            ?.getBoundingClientRect();
          if (domRect) {
            e.coords = [domRect.left, domRect.top];
            gridElements.set(e.id, e);
          }
        });
      const newRects = unPositionedElements.map((e) => {
        const newGridElem = placeUnpositionedRect(e, gridElements, gridInfo);
        const shiftedRects = moveDisplacedRects(
          newGridElem,
          gridElements,
          gridInfo
        );
        shiftedRects.forEach((e) => {
          gridElements.set(e.id, e);
        });
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
    }
  }, [gridElements, animate, animation, gridInfo]);

  const dragTransition = useMemo(() => {
    const { gridUnitHeight, gridUnitWidth } = gridInfo;
    return {
      power: 0.02,
      min: 0,
      max: 50,
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
  }, [gridInfo]);

  return (
    <motion.div
      ref={ref}
      id="grid"
      className="h-full w-full relative z-10"
      animate={animation}
    >
      <AnimatePresence>
        {[...gridElements.values()]
          .filter((e) => e.hasPositioned)
          .map(({ id, coords, width, height, isLocked }) => {
            const MappedCard = cardMap[id];
            return (
              <MappedCard
                dragConstraints={{
                  ...gridInfo.bounds,
                  right: gridInfo.bounds.right - width,
                  bottom: gridInfo.bounds.bottom - height,
                }}
                width={width}
                height={height}
                dragElastic={0.3}
                key={id}
                id={id}
                dragTransition={dragTransition}
                style={{
                  x: coords[0],
                  y: coords[1],
                }}
                isLocked={isLocked}
                exit={{
                  opacity: 0,
                  width: 0,
                  height: 0,
                }}
              />
            );
          })}
      </AnimatePresence>
      <GridBackdrop gridInfo={gridInfo} />
    </motion.div>
  );
};

export default Grid;
