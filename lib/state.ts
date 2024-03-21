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

const cards: Record<CARD_TYPES, GridElement> = {
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
    width: 6,
    height: 8.25,
  },
  Contacts: {
    id: CARD_TYPES.Contacts,
    coords: [1, 1],
    isLocked: false,
    width: 3.5,
    height: 3.5,
  },
  Location: {
    id: CARD_TYPES.Location,
    coords: [1, 1],
    isLocked: false,
    width: 4.5,
    height: 3.5,
  },
  Status: {
    id: CARD_TYPES.Status,
    coords: [1, 1],
    isLocked: false,
    width: 3.5,
    height: 3.5,
  },
};

const getGridProps = (dimensions: Dimensions): Omit<GridInfo, "oldVals"> => {
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
      left: 0,
      right: width,
      top: gridCellHeight,
      bottom: height,
    },
  };
};

type GridElementListener = Dispatch<
  SetStateAction<Map<CARD_TYPES, GridElement>>
>;

export type GridStore = {
  dimensions: Dimensions;
  listeners: GridElementListener[];
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
    listeners: [],
    addListener: (dispatch: GridElementListener) => {
      const listeners = get().listeners;
      listeners.push(dispatch);

      set({ listeners });
      return () =>
        set((state) => ({
          listeners: state.listeners.filter((sub) => sub !== dispatch),
        })); // Return unsubscribe function
    },
    dimensions,
    gridInfo: getGridProps(dimensions),
    initElements: [CARD_TYPES.Home].map((id) => cards[id]),
    pushElements: (ids: CARD_TYPES[]) => {
      const { listeners, gridInfo } = get();
      const { gridCellHeight, gridCellWidth, gridUnitHeight, gridUnitWidth } =
        gridInfo;
      listeners.forEach((dispatch) => {
        dispatch((map) => {
          ids.forEach((id) => {
            const initElem = cards[id];
            const elem = map.get(id) ?? initElem;

            map.set(id, {
              ...elem,
              coords: [
                initElem.coords[0] * gridCellWidth,
                initElem.coords[1] * gridCellHeight,
              ],
              width: elem.width * gridUnitWidth,
              height: elem.height * gridUnitHeight,
              hasPositioned: false,
            });
          });
          return new Map(map);
        });
      });
    },
    lockElements: (ids: CARD_TYPES[]) => {
      get().listeners.forEach((dispatch) => {
        dispatch((map) => {
          ids.forEach((id) => {
            const elem = map.get(id);
            if (elem) {
              map.set(id, { ...elem, isLocked: !elem.isLocked });
            }
          });
          return new Map(map);
        });
      });
    },
    closeElements: (ids: CARD_TYPES[]) => {
      get().listeners.forEach((dispatch) => {
        dispatch((map) => {
          ids.forEach((id) => {
            map.delete(id);
          });
          return new Map(map);
        });
      });
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
