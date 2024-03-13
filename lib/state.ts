import { CARD_TYPES } from "@/components/Cards/types";
import { createContext } from "react";
import { createStore } from "zustand";

export type Dimensions = {
  width: number;
  height: number;
};

export type Grid = {
  numCols: number;
  numRows: number;
  gridCellWidth: number;
  gridCellHeight: number;
  gridUnitWidth: number;
  gridUnitHeight: number;
  vertexSize: number;
  gapRatio: number;
  gapSize: number;
  oldVals?: Omit<Grid, "oldVals"> | null;
  bounds: { x: [number, number]; y: [number, number] };
};

type CardElement = {
  id: CARD_TYPES;
  coords: [number, number];
  isLocked: boolean;
  width: number;
  height: number;
};

const NUM_COLS = 60;
const NUM_ROWS = 48;
const UNIT_SIZE = 4;

const cards: Record<CARD_TYPES, CardElement> = {
  Home: {
    id: CARD_TYPES.Home,
    coords: [1, 1],
    isLocked: false,
    width: 6,
    height: 4.5,
  },
  Menu: {
    id: CARD_TYPES.Menu,
    coords: [42, 42],
    isLocked: true,
    width: 3,
    height: 1,
  },
  Projects: {
    id: CARD_TYPES.Projects,
    coords: [1, 1],
    isLocked: false,
    width: 5,
    height: 6.25,
  },
  Experience: {
    id: CARD_TYPES.Experience,
    coords: [1, 1],
    isLocked: false,
    width: 5,
    height: 6.25,
  },
  Contacts: {
    id: CARD_TYPES.Contacts,
    coords: [1, 1],
    isLocked: false,
    width: 3,
    height: 3,
  },
  Location: {
    id: CARD_TYPES.Location,
    coords: [1, 1],
    isLocked: false,
    width: 5,
    height: 6.25,
  },
  Status: {
    id: CARD_TYPES.Status,
    coords: [1, 1],
    isLocked: false,
    width: 3,
    height: 3,
  },
};

const getGridProps = (dimensions: Dimensions): Omit<Grid, "oldVals"> => {
  const { width, height } = dimensions;
  const gridCellWidth = width / NUM_COLS;
  const gridCellHeight = height / NUM_ROWS;
  const gridUnitWidth = gridCellWidth * UNIT_SIZE;
  return {
    numCols: NUM_COLS,
    numRows: NUM_ROWS,
    gridCellWidth,
    gridCellHeight,
    gridUnitWidth,
    gridUnitHeight: gridCellHeight * UNIT_SIZE,
    vertexSize: 9,
    gapRatio: 0.8,
    gapSize: (1 + 0.8) * 9, //fix this later
    bounds: {
      x: [gridCellWidth, width - (gridUnitWidth + gridCellWidth)],
      y: [gridCellHeight, height - gridCellHeight],
    },
  };
};

export type GridStore = {
  dimensions: Dimensions;
  grid: Grid;
  elements: CardElement[];
  pushElements: (ids: CARD_TYPES[]) => void;
  lockElements: (ids: CARD_TYPES[]) => void;
  setDimensions: (update: Dimensions) => void;
  closeElements: (ids: CARD_TYPES[]) => void;
};

export const GridContext = createContext<typeof useGridStore | null>(null);

export const useGridStore = createStore<GridStore>()((set, get) => {
  const dimensions = {
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  };
  return {
    dimensions,
    grid: getGridProps(dimensions),

    elements: [CARD_TYPES.Home, CARD_TYPES.Menu].map((id) => cards[id]),
    pushElements: (ids: CARD_TYPES[]) => {
      set(() => ({
        elements: get().elements.concat(ids.map((id) => cards[id])),
      }));
    },
    lockElements: (ids: CARD_TYPES[]) =>
      set(() => ({
        elements: get().elements.map((element) => {
          console.log(!element.isLocked);
          return ids.includes(element.id)
            ? { ...element, isLocked: !element.isLocked }
            : element;
        }),
      })),
    closeElements: (ids: CARD_TYPES[]) => {
      const currElements = get().elements.filter((e) => !ids.includes(e.id));
      set(() => ({
        elements: currElements,
      }));
    },
    setDimensions: (dimensions: Dimensions) => {
      const oldDimensions = get().dimensions;
      const newVals = getGridProps(dimensions);
      const oldVals = getGridProps(oldDimensions);
      const root = document.documentElement;
      root.style.setProperty("--grid-width", `${newVals.gridUnitWidth}px`);
      root.style.setProperty("--grid-height", `${newVals.gridUnitHeight}px`);
      root.style.setProperty("--x-padding", `${newVals.gapSize / 4}px`);
      root.style.setProperty("--y-padding", `${newVals.gapSize / 4}px`);
      set(() => ({ dimensions, grid: { ...newVals, oldVals } }));
    },
  };
});
