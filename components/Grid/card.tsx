/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Dimensions, GridInfo } from "@/lib/state";
import { DragHandlers, useAnimation } from "framer-motion";
import { ComponentProps, useEffect } from "react";
import { TitleCard } from "../Cards/BaseCard";
import { CARD_TYPES } from "../Cards/types";
import { DRAG_TIMEOUT, ELEMENT_MAP, GridElement } from "./consts";

const expandTransition = {
  width: {
    duration: 0.2,
    delay: 0.1,
  },
  height: {
    delay: 0.1,
    duration: 0.2,
  },
  x: {
    duration: 0.2,
  },
  y: {
    duration: 0.2,
  },
  opacity: {
    duration: 0.3,
    ease: "easeInOut",
  },
};

const minimizeTransition = {
  width: {
    duration: 0.2,
  },
  height: {
    duration: 0.2,
  },
  x: {
    duration: 0.2,
    delay: 0.1,
  },
  y: {
    duration: 0.2,
    delay: 0.1,
  },
  opacity: {
    duration: 0.3,
    ease: "easeInOut",
  },
};

export const GridCard = (props: {
  dimensions: Dimensions;
  gridElement: GridElement;
  gridInfo: GridInfo;
  activeCard?: CARD_TYPES | null;
  onDragEnd?: DragHandlers["onDragEnd"];
}) => {
  const { canExpand, id, coords, width, height } = props.gridElement;
  const { gridUnitSize, bounds, isMobile } = props.gridInfo;
  const { activeCard, dimensions } = props;
  const controls = useAnimation();
  const CardContent = ELEMENT_MAP[id];
  const dragTransition: ComponentProps<typeof TitleCard>["dragTransition"] = {
    max: 3,
    power: 0.2,
    timeConstant: DRAG_TIMEOUT,
    modifyTarget: (target: number) =>
      Math.round(target / gridUnitSize) * gridUnitSize,
  };
  useEffect(() => {
    if (!activeCard !== null) {
      activeCard === id ? controls.start("expand") : controls.start("minimize");
    }
  }, [controls, activeCard]);

  return (
    <TitleCard
      title={id}
      canExpand={canExpand}
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
      animate={controls}
      custom={id}
      variants={{
        exit: {
          opacity: 0,
          width: 0,
          height: 0,
        },
        expand: (id) => ({
          width: [null, id === activeCard ? bounds.right : width],
          height: [
            null,
            id === activeCard ? dimensions.height - gridUnitSize * 5 : height,
          ],
          borderWidth: [null, 0],
          zIndex: id === activeCard ? 10 : -10,
          x: [null, gridUnitSize * 1],
          y: [null, gridUnitSize * 1],
          opacity: activeCard === id ? 1 : activeCard ? 0 : 1,
          transition: expandTransition,
        }),
        minimize: (id) => ({
          ...{
            x: [null, coords[0]],
            y: [null, coords[1]],
            width: [null, width],
            height: [null, height],
            borderWidth: [null, 1],
            transition: minimizeTransition,
          },
          opacity: activeCard === id ? 1 : activeCard ? 0 : 1,
        }),
      }}
    >
      <CardContent />
    </TitleCard>
  );
};
