import dynamic from "next/dynamic";
import { ComponentProps, ComponentType } from "react";
import Card from "../Card";
import LoadingCard from "../Cards/LoadingCard";
import { CARD_TYPES } from "../Cards/types";
import { GridElement } from "./util";

export const DEFAULT_INIT_ELEMS = [CARD_TYPES.Home];
export const DEFAULT_COORDS: [number, number] = [1, 1];
export const GRID_QUERY_KEY = "content";

export const ELEMENT_MAP: Record<
  CARD_TYPES,
  ComponentType<ComponentProps<typeof Card>>
> = {
  Home: dynamic(() => import("../Cards/HeroCard"), {
    loading: (props) => <LoadingCard {...props} />,
    ssr: false,
  }),
  Menu: dynamic(() => import("../Cards/MenuCard"), {
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

export const DEFAULT_GRID_ELEMENTS: Record<CARD_TYPES, GridElement> = {
  Home: {
    id: CARD_TYPES.Home,
    coords: DEFAULT_COORDS,
    isLocked: false,
    width: 5,
    height: 2,
  },
  Menu: {
    id: CARD_TYPES.Menu,
    coords: [42, 42],
    isLocked: true,
    width: 3,
    height: 3,
  },
  Projects: {
    id: CARD_TYPES.Projects,
    coords: DEFAULT_COORDS,
    isLocked: false,
    width: 5,
    height: 3,
  },
  Experience: {
    id: CARD_TYPES.Experience,
    coords: DEFAULT_COORDS,
    isLocked: false,
    width: 5,
    height: 4,
  },
  Contacts: {
    id: CARD_TYPES.Contacts,
    coords: DEFAULT_COORDS,
    isLocked: false,
    width: 2,
    height: 1.25,
  },
  Location: {
    id: CARD_TYPES.Location,
    coords: DEFAULT_COORDS,
    isLocked: false,
    width: 2.75,
    height: 2,
  },
  Status: {
    id: CARD_TYPES.Status,
    coords: DEFAULT_COORDS,
    isLocked: false,
    width: 3.5,
    height: 3.5,
  },
  Resume: {
    id: CARD_TYPES.Resume,
    coords: DEFAULT_COORDS,
    isLocked: false,
    width: 4.0,
    height: 5.0,
  },
};
