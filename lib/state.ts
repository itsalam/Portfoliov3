import { CARD_TYPES } from "@/components/Cards/types";
import { GridElement } from "@/components/util/gridUtil";
import { Dispatch, SetStateAction, createContext } from "react";
import { createStore } from "zustand";
import { SchemaStores, createCMSSlices } from "./fetchData";

export type Dimensions = {
  width: number;
  height: number;
  containerHeight: number;
};

export type GridInfo = {
  unitSize: number;
  ratio: number;
  numCols: number;
  numRows: number;
  gridCellSize: number;
  gridUnitSize: number;
  vertexSize: number;
  gapSize: number;
  oldVals?: Omit<GridInfo, "oldVals"> | null;
  bounds: { left: number; right: number; top: number; bottom: number };
};

const NUM_COLS = 48;
export const CELL_SIZE = 4;
const VERTEX_SIZE = 9;

const getGridProps = (dimensions: Dimensions): Omit<GridInfo, "oldVals"> => {
  const { width, containerHeight, height } = dimensions;
  const ratio = Math.floor((width / height) * CELL_SIZE) / CELL_SIZE;
  const gridUnitSize = width / NUM_COLS;
  // const gridCellHeight = Math.round(height / NUM_ROWS);
  const gridCellSize = gridUnitSize * CELL_SIZE;
  // const gridUnitHeight = Math.round(gridCellHeight * UNIT_SIZE);

  return {
    unitSize: CELL_SIZE,
    ratio,
    numCols: NUM_COLS,
    numRows: Math.floor(containerHeight / gridUnitSize),
    gridCellSize,
    gridUnitSize,
    vertexSize: VERTEX_SIZE,
    gapSize: 2 * VERTEX_SIZE, //fix this later
    bounds: {
      left: 0,
      right: width,
      top: gridUnitSize,
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
  pushElements: (ids: CARD_TYPES[]) => void;
  lockElements: (ids: CARD_TYPES[]) => void;
  setDimensions: (update: Partial<Dimensions>) => void;
  closeElements: (ids: CARD_TYPES[]) => void;
  updateDimensions: () => void;
};

export const GridContext = createContext<typeof useGridStore | null>(null);
export const CMSContext = createContext<ReturnType<typeof useCMSStore> | null>(
  null
);

export const useCMSStore = (
  setLoading: Dispatch<SetStateAction<Promise<void>[]>>
) =>
  createStore<Partial<SchemaStores>>()((set, get) => {
    return {
      initialize: () => {
        const slices = createCMSSlices(set);
        const allCMSLoaded = Promise.all<void>(slices).then(() => {});
        setLoading((curr) => curr.concat([allCMSLoaded, ...slices]));
      },
    };
  });

export const useGridStore = createStore<GridStore>()((set, get) => {
  const updateDimensions = () => {
    const dimensions = {
      width: typeof window !== "undefined" ? window.innerWidth : 0,
      height: typeof window !== "undefined" ? window.innerHeight : 0,
      containerHeight: typeof window !== "undefined" ? window.innerHeight : 0,
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
    setDimensions: (dimensions: Partial<Dimensions>) => {
      const oldDimensions = get().dimensions;
      const fullDimensions = { ...oldDimensions, ...dimensions } as Dimensions;
      const newVals = getGridProps(fullDimensions);
      const oldVals = getGridProps(oldDimensions);
      const root = document.documentElement;
      root.style.setProperty("--cell-size", `${newVals.gridCellSize}px`);
      root.style.setProperty("--cell-padding", `${newVals.gapSize / 4}px`);
      set(() => ({
        dimensions: fullDimensions,
        gridInfo: { ...newVals, oldVals },
      }));
    },
  };
});
