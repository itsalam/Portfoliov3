import { CARD_TYPES } from "../Cards/types";

export const CARD_MENU_GROUP: Record<string, CARD_TYPES[]> = {
  home: [CARD_TYPES.Home],
  projects: [CARD_TYPES.Projects],
  experience: [CARD_TYPES.Experience],
  info: [CARD_TYPES.Resume, CARD_TYPES.Location, CARD_TYPES.Contacts],
};

export const SCROLL_TO_CARD_DELAY = 200;
export const DRAG_TIMEOUT = 0;
type GridElemDimensions = {
  width: number;
  height: number;
};

export type DefaultGridElement = {
  id: CARD_TYPES;
  initialCoords: [number, number];
  initialDimensions: GridElemDimensions;
  mobileDimensions?: GridElemDimensions;
  wideDimensions?: GridElemDimensions;
  canExpand?: boolean;
};

export type GridElement = {
  id: CARD_TYPES;
  coords: [number, number];
  hasPositioned?: boolean;
  width: number;
  height: number;
  canExpand?: boolean;
};

export type GridElements = Map<CARD_TYPES, GridElement>;

export const DEFAULT_INIT_ELEMS = [CARD_TYPES.Home];
export const DEFAULT_COORDS: [number, number] = [1, 1];
export const GRID_QUERY_KEY = "content";

export const DEFAULT_GRID_ELEMENTS: Record<CARD_TYPES, DefaultGridElement> = {
  home: {
    id: CARD_TYPES.Home,
    canExpand: true,
    initialCoords: DEFAULT_COORDS,
    initialDimensions: {
      width: 550,
      height: 250,
    },
    mobileDimensions: {
      width: 550,
      height: 300,
    },
    wideDimensions: {
      width: 550,
      height: 300,
    },
  },
  projects: {
    id: CARD_TYPES.Projects,
    canExpand: true,
    initialCoords: DEFAULT_COORDS,
    initialDimensions: {
      width: 750,
      height: 350,
    },
    mobileDimensions: {
      width: 550,
      height: 325,
    },
    wideDimensions: {
      width: 750,
      height: 450,
    },
  },
  experience: {
    id: CARD_TYPES.Experience,
    canExpand: true,
    initialCoords: DEFAULT_COORDS,
    initialDimensions: {
      width: 550,
      height: 650,
    },
    mobileDimensions: {
      width: 550,
      height: 650,
    },
    wideDimensions: {
      width: 650,
      height: 850,
    },
  },
  contacts: {
    id: CARD_TYPES.Contacts,
    initialCoords: DEFAULT_COORDS,
    initialDimensions: {
      width: 220,
      height: 145,
    },
    mobileDimensions: {
      width: 400,
      height: 200,
    },
    wideDimensions: { width: 275, height: 150 },
  },
  location: {
    id: CARD_TYPES.Location,
    initialCoords: DEFAULT_COORDS,
    initialDimensions: {
      width: 300,
      height: 225,
    },
    mobileDimensions: {
      width: 400,
      height: 250,
    },
    wideDimensions: { width: 500, height: 350 },
  },
  resume: {
    id: CARD_TYPES.Resume,
    initialCoords: DEFAULT_COORDS,
    initialDimensions: {
      width: 450,
      height: 550,
    },
  },
};
