"use client";

import { CARD_TYPES } from "@/components/Cards/types";
import { GridElements } from "@/components/Grid/consts";
import { Dispatch, SetStateAction, createContext } from "react";
import { StoreApi, createStore } from "zustand";

const NUM_COLS = 48;
export const CELL_SIZE = 4;
const VERTEX_SIZE = 9;

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
  isMobile: boolean;
  isWide: boolean;
};

const getGridProps = (dimensions: Dimensions): Omit<GridInfo, "oldVals"> => {
  const { width, containerHeight, height } = dimensions;
  const ratio = Math.floor((width / height) * CELL_SIZE) / CELL_SIZE;
  const gridUnitSize = width / NUM_COLS;
  const gridCellSize = gridUnitSize * CELL_SIZE;
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
      right: width - gridCellSize,
      top: gridUnitSize,
      bottom: containerHeight,
    },
    isMobile: width < 550,
    isWide: width > 1800,
  };
};

type GridElementListener = {
  dispatch: Dispatch<SetStateAction<GridElements>>;
  pushElements: (ids: CARD_TYPES[]) => void;
  closeElements: (ids: CARD_TYPES[]) => void;
};

export type GridStore = {
  activeCard?: CARD_TYPES | null;
  dimensions: Dimensions;
  listener: GridElementListener | null;
  initialCards?: CARD_TYPES[];
  addListener: (dispatch: GridElementListener) => () => void;
  gridInfo: GridInfo;
  pushElements: (ids: CARD_TYPES[]) => void;
  setDimensions: (update?: Partial<Dimensions>) => void;
  closeElements: (ids: CARD_TYPES[]) => void;
  updateDimensions: () => void;
  toggleCard: (id?: CARD_TYPES | null) => void;
};

export const GridContext = createContext<StoreApi<GridStore> | null>(null);
export const useGridStore = (defaults: Partial<GridStore>) =>
  createStore<GridStore>()((set, get) => {
    const updateDimensions = () => {
      const rect =
        typeof window !== "undefined"
          ? document?.querySelector("main")?.getBoundingClientRect()
          : null;
      const { width, height } = rect ?? {
        width: typeof window !== "undefined" ? window.innerWidth : 0,
        height: typeof window !== "undefined" ? window.innerHeight : 0,
      };
      const dimensions = {
        width,
        height,
        containerHeight: typeof window !== "undefined" ? window.innerHeight : 0,
      } as Dimensions;
      return dimensions;
    };
    const dimensions = updateDimensions();

    return {
      ...defaults,
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
      closeElements: (ids: CARD_TYPES[]) => {
        get().listener?.closeElements(ids);
      },
      updateDimensions: () => {
        get().setDimensions();
      },
      toggleCard: (id) => {
        const { activeCard } = get();
        set(() => ({ activeCard: activeCard !== id ? id : null }));
      },
      setDimensions: (dimensions?: Partial<Dimensions>) => {
        const oldDimensions = get().dimensions;
        const fullDimensions = {
          ...oldDimensions,
          ...updateDimensions(),
          ...dimensions,
        } as Dimensions;
        const newVals = getGridProps(fullDimensions);
        const oldVals = getGridProps(oldDimensions);
        const root = document.documentElement;
        root.style.setProperty("--cell-size", `${newVals.gridCellSize}px`);
        root.style.setProperty("--cell-padding", `${newVals.gapSize / 4}px`);
        root.style.setProperty("--width", `${fullDimensions.width}px`);
        set(() => ({
          dimensions: fullDimensions,
          gridInfo: { ...newVals, oldVals },
        }));
      },
    };
  });
