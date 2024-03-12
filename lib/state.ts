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
  isLocked?: boolean;
};

const NUM_COLS = 60;
const NUM_ROWS = 48;
const UNIT_SIZE = 4;

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
  pushElements: (elements: CardElement[]) => void;
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
    elements: [
      {
        id: CARD_TYPES.Home,
        coords: [1, 1],
        isLocked: false,
      },
      {
        id: CARD_TYPES.Menu,
        coords: [42, 42],
        isLocked: true,
      },
    ],
    pushElements: (elements: CardElement[]) => {
      set(() => ({
        elements: get().elements.concat(elements),
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
