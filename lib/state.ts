import { CARD_TYPES } from "@/components/Cards/types";
import { GridElement } from "@/components/util/gridUtil";
import { Dispatch, SetStateAction, createContext } from "react";
import { createStore } from "zustand";

export type Dimensions = {
  width: number;
  height: number;
};

export type GridInfo = {
  numCols: number;
  numRows: number;
  gridCellWidth: number;
  gridCellHeight: number;
  gridUnitWidth: number;
  gridUnitHeight: number;
  vertexSize: number;
  gapRatio: number;
  gapSize: number;
  oldVals?: Omit<GridInfo, "oldVals"> | null;
  bounds: { left: number; right: number; top: number; bottom: number };
};

const NUM_COLS = 48;
const NUM_ROWS = 48;
const UNIT_SIZE = 4;

export const DEFAULT_COORDS: [number, number] = [1, 1];

export const DEFAULT_GRID_ELEMENTS: Record<CARD_TYPES, GridElement> = {
  Home: {
    id: CARD_TYPES.Home,
    coords: DEFAULT_COORDS,
    isLocked: false,
    width: 5,
    height: 4,
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
    coords: DEFAULT_COORDS,
    isLocked: false,
    width: 5,
    height: 6.25,
  },
  Experience: {
    id: CARD_TYPES.Experience,
    coords: DEFAULT_COORDS,
    isLocked: false,
    width: 5,
    height: 8.25,
  },
  Contacts: {
    id: CARD_TYPES.Contacts,
    coords: DEFAULT_COORDS,
    isLocked: false,
    width: 2.5,
    height: 4,
  },
  Location: {
    id: CARD_TYPES.Location,
    coords: DEFAULT_COORDS,
    isLocked: false,
    width: 3.5,
    height: 4,
  },
  Status: {
    id: CARD_TYPES.Status,
    coords: DEFAULT_COORDS,
    isLocked: false,
    width: 3.5,
    height: 3.5,
  },
};

const getGridProps = (dimensions: Dimensions): Omit<GridInfo, "oldVals"> => {
  const { width, height } = dimensions;
  const gridCellWidth = Math.round(width / NUM_COLS);
  const gridCellHeight = Math.round(height / NUM_ROWS);
  const gridUnitWidth = Math.round(gridCellWidth * UNIT_SIZE);
  const gridUnitHeight = Math.round(gridCellHeight * UNIT_SIZE);

  return {
    numCols: NUM_COLS,
    numRows: NUM_ROWS,
    gridCellWidth,
    gridCellHeight,
    gridUnitWidth,
    gridUnitHeight,
    vertexSize: 9,
    gapRatio: 0.8,
    gapSize: (1 + 0.8) * 9, //fix this later
    bounds: {
      left: 0,
      right: width,
      top: gridCellHeight,
      bottom: height,
    },
  };
};

type GridElementListener = {
  dispatch: Dispatch<SetStateAction<Map<CARD_TYPES, GridElement>>>;
  pushElements: (ids: CARD_TYPES[]) => void;
  lockElements: (ids: CARD_TYPES[]) => void;
  closeElements: (ids: CARD_TYPES[]) => void;
};

export type GridStore = {
  dimensions: Dimensions;
  listener: GridElementListener | null;
  addListener: (dispatch: GridElementListener) => () => void;
  gridInfo: GridInfo;
  initElements: GridElement[];
  pushElements: (ids: CARD_TYPES[]) => void;
  lockElements: (ids: CARD_TYPES[]) => void;
  setDimensions: (update: Dimensions) => void;
  closeElements: (ids: CARD_TYPES[]) => void;
  updateDimensions: () => void;
};

export const GridContext = createContext<typeof useGridStore | null>(null);

export const useGridStore = createStore<GridStore>()((set, get) => {
  const updateDimensions = () => {
    const dimensions = {
      width: typeof window !== "undefined" ? window.innerWidth : 0,
      height: typeof window !== "undefined" ? window.innerHeight : 0,
    } as Dimensions;
    return dimensions;
  };
  const dimensions = updateDimensions();
  return {
    listener: null,
    addListener: (listener: GridElementListener) => {
      set({ listener });
      return () => {
        set((state) => ({
          ...state,
          listeners: null,
        })); // Return unsubscribe function
      };
    },
    dimensions,
    gridInfo: getGridProps(dimensions),
    initElements: [CARD_TYPES.Home].map((id) => DEFAULT_GRID_ELEMENTS[id]),
    pushElements: (ids: CARD_TYPES[]) => {
      const { listener } = get();
      listener?.pushElements(ids);
    },
    lockElements: (ids: CARD_TYPES[]) => {
      get().listener?.lockElements(ids);
    },
    closeElements: (ids: CARD_TYPES[]) => {
      get().listener?.closeElements(ids);
    },
    updateDimensions: () => {
      get().setDimensions(updateDimensions());
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
      set(() => ({ dimensions, gridInfo: { ...newVals, oldVals } }));
    },
  };
});
