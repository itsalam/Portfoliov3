import { atom } from "jotai";

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
  oldVals: Omit<Grid, "oldVals"> | null;
};

const NUM_COLS = 48;
const NUM_ROWS = 36;
const UNIT_SIZE = 4;

const baseDimensionAtom = atom<Dimensions>({
  height: 0,
  width: 0,
});

const getGridProps = (dimensions: Dimensions): Omit<Grid, "oldVals"> => {
  const { width, height } = dimensions;
  return {
    numCols: NUM_COLS,
    numRows: NUM_ROWS,
    gridCellWidth: width / NUM_COLS,
    gridCellHeight: height / NUM_ROWS,
    gridUnitWidth: (width / NUM_COLS) * UNIT_SIZE,
    gridUnitHeight: (height / NUM_ROWS) * UNIT_SIZE,
    vertexSize: 9,
    gapRatio: 0.8,
    gapSize: (1 + 0.8) * 9, //fix this later
  };
};

export const dimensionAtom = atom(
  (get) => {
    return get(baseDimensionAtom);
  },
  (get, set, update: Dimensions) => {
    console.log(update);
    // Write function - updates both current and previous grid values
    const oldDimensions = get(baseDimensionAtom);
    const oldVals = getGridProps(oldDimensions);
    set(previousGridAtom, oldVals); // Set the previous grid state
    set(baseDimensionAtom, update); // Set the
    set(gridAtom, { ...getGridProps(update), oldVals }); // Set the previous grid state
  }
);

export const previousGridAtom = atom<Omit<Grid, "oldVals"> | null>(null);

export const gridAtom = atom<Grid>({
  ...getGridProps({ width: 0, height: 0 }),
  oldVals: null,
});
