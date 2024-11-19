/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { GridContext } from "@/lib/providers/clientState";

import { useBreakpoints } from "@/lib/providers/breakpoint";
import { cn } from "@/lib/utils";
import { DragHandlers, m, useAnimation } from "framer-motion";
import { Maximize, X } from "lucide-react";
import dynamic from "next/dynamic";
import {
  ComponentProps,
  ComponentType,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useStore } from "zustand";
import BaseCard from "../Cards/BaseCard";
import HeroCard from "../Cards/HeroCard";
import LoadingCard from "../Cards/LoadingCard";
import { CARD_TYPES } from "../Cards/types";
import { GridElement } from "./consts";

const expandTransition = {
  height: {
    delay: 0.3,
  },
  opacity: {
    duration: 0.6,
    ease: "easeInOut",
  },
};

const minimizeTransition = {
  duration: 0.3,
  opacity: {
    duration: 0.3,
    ease: "easeInOut",
  },
};

export const GridCard = ({
  gridElement,
}: {
  gridElement: GridElement;
  onDragEnd?: DragHandlers["onDragEnd"];
}) => {
  const { canExpand, id, coords, width, height } = gridElement;
  const initialLoad = useRef(true);
  const context = useContext(GridContext)!;
  const { gridInfo, dimensions, activeCard, closeElements, toggleCard } =
    useStore(context);
  const breakpoint = useBreakpoints();
  const isSmall = breakpoint === "xs" || breakpoint === "sm";
  const { gridUnitSize } = gridInfo;
  const controls = useAnimation();
  const CardContent = ELEMENT_MAP[id];
  const lastCard = useRef<CARD_TYPES | null>();

  const isActive = activeCard === id;
  const x = isActive && isSmall ? 0 : coords[0];
  const y = isActive && isSmall ? 0 : coords[1];
  const widthValue = isActive ? dimensions.width : width;
  const heightValue = isActive ? dimensions.height - gridUnitSize * 3 : height;
  const opacityValue = isActive ? 1 : activeCard ? 0 : 1;

  useEffect(() => {
    if (activeCard === lastCard.current) {
      controls.start({
        left: [null, x],
        top: [null, y],
        width: [null, widthValue],
        height: [null, heightValue],
      });
      return;
    }
    if (activeCard === id) {
      controls.start("expand");
    } else if ((activeCard && activeCard !== id) || lastCard.current) {
      controls.start("minimize");
    } else if (!activeCard) {
      controls.start("open");
    }
    lastCard.current = activeCard;
  }, [activeCard, coords, width, height]);

  return (
    <BaseCard
      layout
      layoutId={`menu-card-${id}`}
      key={id}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      style={
        {
          "--card-width": `${width}px`,
          "--card-height": `${heightValue}px`,
        } as React.CSSProperties
      }
      className={cn(
        "absolute h-0 w-0",
        activeCard === id && "focus-card"
      )}
      title={id}
      exit={"exit"}
      id={id}
      animate={controls}
      custom={id}
      initial={activeCard && initialLoad.current ? "expand" : { opacity: 0 }}
      onAnimationStart={(e) => console.log({ id, x, y, e })}
      variants={{
        exit: {
          opacity: 0,
          width: 0,
          height: 0,
        },
        expand: (id) => {
          return {
            width: initialLoad.current
              ? [widthValue, widthValue]
              : [null, widthValue],
            height: initialLoad.current
              ? [heightValue, heightValue]
              : [null, heightValue],
            borderWidth: [0.0, 0.0],
            zIndex: [null, 10],
            left: [null, isSmall ? 0 : 0],
            top: [null, isSmall ? 0 : 0],
            opacity: initialLoad.current
              ? [0, opacityValue]
              : [null, opacityValue],
            transition: expandTransition,
          };
        },
        minimize: (id) => ({
          transition: minimizeTransition,
          opacity: activeCard === id ? 1 : activeCard ? 0 : 1,
          left: [null, x],
          top: [null, y],
          ...(lastCard.current === id
            ? {
                width: [null, width],
                height: [null, height],
                borderWidth: [null, 1.0],
                zIndex: 0,
              }
            : {}),
        }),
        open: {
          left: x,
          top: y,
          width,
          height,
          borderWidth: 1.0,
          transition: minimizeTransition,
          opacity: 1,
        },
      }}
      buttons={[
        ...(canExpand
          ? [{ Icon: Maximize, onClick: () => toggleCard(id as CARD_TYPES) }]
          : []),
        { Icon: X, onClick: () => id && closeElements([id as CARD_TYPES]) },
      ].filter(Boolean)}
      containerProps={{
        onClick: (e) => {
          if (activeCard !== id && !activeCard && canExpand) {
            e.stopPropagation();
            toggleCard(id);
          }
        },
      }}
    >
      <CardContent />
    </BaseCard>
  );
};

export const ELEMENT_MAP: Record<
  CARD_TYPES,
  ComponentType<ComponentProps<typeof m.div>> & { active?: boolean }
> = {
  home: HeroCard,
  projects: dynamic(() => import("../Cards/ProjectsCard"), {
    loading: (props) => <LoadingCard {...props} />,
    ssr: false,
  }),
  experience: dynamic(() => import("../Cards/ExperienceCard"), {
    loading: (props) => <LoadingCard {...props} />,
    ssr: false,
  }),
  contacts: dynamic(() => import("../Cards/ContactsCard"), {
    loading: (props) => <LoadingCard {...props} />,
    ssr: false,
  }),
  location: dynamic(() => import("../Cards/LocationCard"), {
    loading: (props) => <LoadingCard {...props} />,
    ssr: false,
  }),
  resume: dynamic(() => import("../Cards/ResumeCard"), {
    loading: (props) => <LoadingCard {...props} />,
    ssr: false,
  }),
};
