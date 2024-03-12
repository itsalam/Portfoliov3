"use client";

import { GridContext } from "@/lib/state";
import { createMutable } from "@/lib/utils";
import "@radix-ui/themes/styles.css";
import { motion, useAnimate, useAnimation } from "framer-motion";
import {
  ComponentProps,
  ComponentType,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { useStore } from "zustand";
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

const Grid = (props: PropsWithChildren) => {
  const { children } = props;
  const context = useContext(GridContext)!;
  const [ref, animate] = useAnimate();
  const animation = useAnimation();
  const { elements, grid: gridInfo } = useStore(context);
  const [gridElements, setGridElements] = useState<
    Map<CARD_TYPES, GridElement>
  >(
    elements.reduce((map, cardElem) => {
      const Card = cardMap[cardElem.id];
      const node = (
        <Card id={cardElem.id} key={cardElem.id} initCoords={cardElem.coords} />
      );
      map.set(cardElem.id, {
        ...cardElem,
        coords: [
          cardElem.coords[0] * gridInfo.gridCellWidth,
          cardElem.coords[1] * gridInfo.gridCellHeight,
        ],
        node,
        width: 0,
        height: 0,
      });

      return map;
    }, new Map<CARD_TYPES, GridElement>())
  );

  useEffect(() => {
    setGridElements((prev) => {
      const { gridCellHeight, gridCellWidth } = gridInfo;
      const newElements = elements.filter(
        (v) => ![...prev.keys()].includes(v.id)
      );
      const newMap = new Map(prev);
      newElements.forEach((cardElem) => {
        const Card = cardMap[cardElem.id];
        const x = cardElem.coords[0] * gridCellWidth,
          y = cardElem.coords[1] * gridCellHeight;
        const node = (
          <Card
            id={cardElem.id}
            key={cardElem.id}
            initCoords={cardElem.coords ?? [1, 1]}
            style={{
              x,
              y,
            }}
          />
        );

        newMap.set(cardElem.id, {
          ...cardElem,
          coords: [x, y],
          node,
          width: 0,
          height: 0,
        });
      });
      const oldElements = [...newMap.keys()].filter(
        (v) => !elements.map((e) => e.id).includes(v)
      );
      oldElements.length &&
        Promise.all(
          oldElements.map((id) => {
            return animate(
              `#${id}`,
              {
                opacity: 0,
                width: 0,
                height: 0,
              },
              { type: "spring", duration: 0.5 }
            )
              .then(() => {}) // for some animate().then() can only return a void Promise
              .then(() => id);
          })
        ).then((ids) => {
          ids.forEach((id) => {
            newMap.delete(id);
          });
        });
      elements.forEach((element) => {
        const mapElement = newMap.get(element.id);
        if (mapElement) {
          newMap.set(element.id, { ...mapElement, isLocked: element.isLocked });
        }
      });
      return newMap;
    });
  }, [animate, elements, gridInfo]);

  useEffect(() => {
    const { oldVals, gridCellHeight, gridCellWidth } = gridInfo;
    const oldGridCellHeight = oldVals?.gridCellHeight ?? gridCellHeight,
      oldGridCellWidth = oldVals?.gridCellWidth ?? gridCellWidth;
    setGridElements((prevGridElems) => {
      prevGridElems.forEach((prevElement) => {
        const elem = document.querySelector(`#${prevElement.id}`);
        const rect = createMutable<DOMRect>(
          elem!.getBoundingClientRect().toJSON()
        );
        if (
          gridCellHeight !== oldGridCellHeight ||
          gridCellWidth !== oldGridCellWidth
        ) {
          prevElement.coords[0] *= gridCellWidth / oldGridCellWidth;
          prevElement.coords[1] *= gridCellHeight / oldGridCellHeight;
        }
        prevGridElems.set(prevElement.id, {
          ...prevElement,
          width: rect.width,
          height: rect.height,
        });
        animate(
          `#${prevElement.id}`,
          {
            x: prevElement.coords[0],
            y: prevElement.coords[1],
          },
          { duration: 0.01 }
        );
      });
      return prevGridElems;
    });
  }, [gridInfo, animate]);

  useEffect(() => {
    const elemArrs = Array.from(gridElements.values());
    const unPositionedElements = elemArrs.filter((e) => !e.hasPositioned);
    if (unPositionedElements.length) {
      const newRects = unPositionedElements.map((e) => {
        const gridElem = placeUnpositionedRect(e, gridElements, gridInfo);
        gridElements.set(gridElem.id, gridElem);
        return gridElem.id;
      });

      const stack = [...newRects];
      while (stack.length) {
        const id = stack.shift()!;
        const elem = gridElements.get(id) as GridElement;
        const shiftedRects = moveDisplacedRects(elem, gridElements, gridInfo);
        shiftedRects.forEach((e) => {
          gridElements.set(e.id, e);
          if (!stack.includes(e.id)) {
            stack.push(e.id);
          }
        });
      }
      setTimeout(() => {
        gridElements.forEach((e) => {
          animate(
            `#${e.id}`,
            {
              x: e.coords[0],
              y: e.coords[1],
            },
            { duration: e.hasPositioned ? 0.233 : 0 }
          )
            .then(() => {
              animation.start("open");
            })
            .then(() => {
              gridElements.set(e.id, {
                ...e,
                hasPositioned: true,
              });
              if (newRects.length) {
                setGridElements(new Map(gridElements));
              }
            });
        });
      }, 10);
    }
  }, [gridElements, animate, animation, gridInfo]);

  return (
    <motion.div ref={ref} className="h-screen w-screen" animate={animation}>
      {[...gridElements.values()].map(({ node }) => node)}
    </motion.div>
  );
};

export default Grid;
