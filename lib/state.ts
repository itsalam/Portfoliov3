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
};

const NUM_COLS = 48;
const NUM_ROWS = 36;
const UNIT_SIZE = 4;

export const dimensionAtom = atom<Dimensions>({
  height: 0,
  width: 0,
});

export const gridAtom = atom<Grid>((get) => {
  const { width, height } = get(dimensionAtom);
  const res = {
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
  return res;
});
