/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { GridContext } from "@/lib/clientState";
import { cn } from "@/lib/utils";
import { DragHandlers, m, useAnimation } from "framer-motion";
import { debounce } from "lodash";
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
import HeroCard from "../Cards/HeroCard";
import Card from "../Cards/HomeCard";
import LoadingCard from "../Cards/LoadingCard";
import { CARD_TYPES } from "../Cards/types";
import { GridElement } from "./consts";

const expandTransition = {
  duration: 0.1,
  opacity: {
    duration: 0.6,
    ease: "easeInOut",
  },
};

const minimizeTransition = {
  duration: 0.1,
  opacity: {
    duration: 0.3,
    ease: "easeInOut",
  },
};

export const GridCard = ({
  gridElement,
  onDragEnd,
  ...otherProps
}: {
  gridElement: GridElement;
  onDragEnd?: DragHandlers["onDragEnd"];
}) => {
  const { canExpand, id, coords, width, height } = gridElement;
  const initialLoad = useRef(true);
  const context = useContext(GridContext)!;
  const { gridInfo, dimensions, activeCard, closeElements, toggleCard } =
    useStore(context);
  const { gridUnitSize, bounds, isMobile } = gridInfo;
  const controls = useAnimation();
  const CardContent = ELEMENT_MAP[id];
  const lastCard = useRef<CARD_TYPES | null>();

  useEffect(() => {
    if (!initialLoad && lastCard.current) {
      controls.start({
        x: coords[0],
        y: coords[1],
        width,
        height,
      });
    }
  }, [coords, width, height]);

  useEffect(() => {
    if (activeCard === id) {
      controls.start("expand");
    } else if (
      (!initialLoad.current && activeCard && activeCard !== id) ||
      lastCard.current
    ) {
      controls.start("minimize");
    } else if (!activeCard) {
      controls.start("open");
    }
    lastCard.current = activeCard;
  }, [activeCard]);

  const animation = debounce(() => {
    if (initialLoad.current) {
      initialLoad.current = false;
    }
  }, 10);

  useEffect(() => {
    animation();
  }, [animation]);

  return (
    <Card
      key={id}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      style={{
        x: coords[0],
        y: coords[1],
      }}
      className={cn(
        "absolute h-0 w-0",
        activeCard === id ? "focus" : ""
      )}
      title={id}
      exit={"exit"}
      id={id}
      animate={controls}
      custom={id}
      initial={activeCard && initialLoad.current ? "expand" : { opacity: 0 }}
      variants={{
        exit: {
          opacity: 0,
          width: 0,
          height: 0,
        },
        expand: (id) => {
          const widthValue = id === activeCard ? bounds.right : width;
          const heightValue =
            id === activeCard ? dimensions.height - gridUnitSize * 3 : height;
          const opacityValue = activeCard === id ? 1 : activeCard ? 0 : 1;

          return {
            width: initialLoad.current
              ? [widthValue, widthValue]
              : [null, widthValue],
            height: initialLoad.current
              ? [heightValue, heightValue]
              : [null, heightValue],
            borderWidth: [0.0, 0.0],
            zIndex: id === activeCard ? 10 : -10,
            x: [null, gridUnitSize * 1],
            y: [null, gridUnitSize * 1],
            opacity: initialLoad.current
              ? [0, opacityValue]
              : [null, opacityValue],
            transition: expandTransition,
          };
        },
        minimize: (id) => ({
          transition: minimizeTransition,
          opacity: activeCard === id ? 1 : activeCard ? 0 : 1,
          ...(lastCard.current === id
            ? {
              x: [null, coords[0]],
              y: [null, coords[1]],
              width: [null, width],
              height: [null, height],
              borderWidth: [null, 1.0],
              zIndex: -10,
            }
            : {}),
        }),
        open: {
          x: coords[0],
          y: coords[1],
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
      {...otherProps}
    >
      <CardContent />
    </Card>
  );
};

export const ELEMENT_MAP: Record<
  CARD_TYPES,
  ComponentType<ComponentProps<typeof m.div>>
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
