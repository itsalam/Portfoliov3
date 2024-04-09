import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { ComponentProps, ComponentType } from "react";
import LoadingCard from "../Cards/LoadingCard";
import { CARD_TYPES } from "../Cards/types";
import { DefaultGridElement, GridElement } from "./util";

export type GridElements = Map<CARD_TYPES, GridElement>;

export const DEFAULT_INIT_ELEMS = [CARD_TYPES.Home];
export const DEFAULT_COORDS: [number, number] = [1, 1];
export const GRID_QUERY_KEY = "content";

export const ELEMENT_MAP: Record<
  CARD_TYPES,
  ComponentType<ComponentProps<typeof motion.div>>
> = {
  Home: dynamic(() => import("../Cards/HeroCard"), {
    loading: (props) => <LoadingCard {...props} />,
    ssr: false,
  }),
  Projects: dynamic(() => import("../Cards/ProjectsCard"), {
    loading: (props) => <LoadingCard {...props} />,
    ssr: false,
  }),
  Experience: dynamic(() => import("../Cards/ExperienceCard"), {
    loading: (props) => <LoadingCard {...props} />,
    ssr: false,
  }),
  Contacts: dynamic(() => import("../Cards/ContactsCard"), {
    loading: (props) => <LoadingCard {...props} />,
    ssr: false,
  }),
  Location: dynamic(() => import("../Cards/LocationCard"), {
    loading: (props) => <LoadingCard {...props} />,
    ssr: false,
  }),
  Status: dynamic(() => import("../Cards/StatusCard"), {
    loading: (props) => <LoadingCard {...props} />,
    ssr: false,
  }),
  Resume: dynamic(() => import("../Cards/ResumeCard"), {
    loading: (props) => <LoadingCard {...props} />,
    ssr: false,
  }),
};

export const DEFAULT_GRID_ELEMENTS: Record<CARD_TYPES, DefaultGridElement> = {
  Home: {
    id: CARD_TYPES.Home,
    initialCoords: DEFAULT_COORDS,
    initialWidth: 550,
    initialHeight: 225,
  },
  Projects: {
    id: CARD_TYPES.Projects,
    initialCoords: DEFAULT_COORDS,
    initialWidth: 550,
    initialHeight: 350,
  },
  Experience: {
    id: CARD_TYPES.Experience,
    initialCoords: DEFAULT_COORDS,
    initialWidth: 550,
    initialHeight: 450,
  },
  Contacts: {
    id: CARD_TYPES.Contacts,
    initialCoords: DEFAULT_COORDS,
    initialWidth: 220,
    initialHeight: 145,
  },
  Location: {
    id: CARD_TYPES.Location,
    initialCoords: DEFAULT_COORDS,
    initialWidth: 300,
    initialHeight: 225,
  },
  Status: {
    id: CARD_TYPES.Status,
    initialCoords: DEFAULT_COORDS,
    initialWidth: 350,
    initialHeight: 350,
  },
  Resume: {
    id: CARD_TYPES.Resume,
    initialCoords: DEFAULT_COORDS,
    initialWidth: 450,
    initialHeight: 550,
  },
};
