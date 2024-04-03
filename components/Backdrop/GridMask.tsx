"use client";

import { GridContext } from "@/lib/state";
import { motion } from "framer-motion";
import React, { useCallback, useContext, useRef } from "react";
import { useStore } from "zustand";
import Vertex from "./Vertex";

export type GridProps = {
  vertexSize?: number;
  gapRatio?: number;
  dotsPerGrid?: number;
};

const GridEffect: React.FC<GridProps> = (props) => {
  const { ...svgProps } = props;

  const store = useContext(GridContext)!;
  const { unitSize, vertexSize, gapSize } = store.getInitialState().gridInfo;
  const { containerHeight, width } = useStore(
    store,
    (store) => store.dimensions
  );
  const { ratio, numRows, numCols, gridCellSize, gridUnitSize } =
    useStore(store).gridInfo;
  const ref = useRef<SVGSVGElement>(null);
  const strokeDasharray = useCallback(
    (dimension: number) => {
      return `${dimension - gapSize} ${gapSize}`;
    },
    [gapSize]
  );
  // numRows & gridCellsize is based on width, and ratio is the cloest
  const gridCols = numCols / unitSize;
  const gridRows = (numRows * ratio) / unitSize;
  const cellHeight = gridCellSize / ratio;

  const VerticalLines = useCallback(() => {
    return Array.from({ length: gridCols + 1 }).map((_, i) => (
      <line
        x1={i * gridCellSize}
        x2={i * gridCellSize}
        y1={0}
        y2={containerHeight}
        key={i}
        strokeDasharray={
          i !== 0 && i !== gridCols ? strokeDasharray(cellHeight) : 0
        }
        strokeDashoffset={-gapSize / 2}
        stroke={
          i % unitSize === 0 ? "#aaaaaa" : i % 2 === 0 ? "#777777" : "#555555"
        }
      />
    ));
  }, [
    gridCols,
    gridCellSize,
    containerHeight,
    strokeDasharray,
    cellHeight,
    gapSize,
    unitSize,
  ]);

  const HorizontalLines = useCallback(() => {
    return Array.from({ length: gridRows + 1 }).map((_, i) => (
      <line
        y1={i * cellHeight}
        y2={i * cellHeight}
        x1={0}
        x2={width}
        key={i}
        strokeDashoffset={-gapSize / 2}
        strokeDasharray={
          i !== 0 && i !== gridRows ? strokeDasharray(gridCellSize) : 0
        }
        stroke={
          i % unitSize === 0 ? "#aaaaaa" : i % 2 === 0 ? "#777777" : "#555555"
        }
      />
    ));
  }, [
    gridRows,
    cellHeight,
    width,
    gapSize,
    strokeDasharray,
    gridCellSize,
    unitSize,
  ]);

  const Vertexs = () => {
    return Array.from({ length: gridCols - 1 }).map((_, i) =>
      Array.from({ length: gridRows }).map((_, j) => (
        <Vertex
          key={`${i}-${j}`}
          position={[(i + 1) * gridCellSize, (j + 1) * cellHeight]}
          size={vertexSize}
          fill={
            (i + 1) % unitSize === 0 && (j + 1) % unitSize === 0
              ? "#ffffff"
              : (i + 1) % 2 === 0 && (j + 1) % 2 === 0
                ? "#999999"
                : "#666666"
          }
        />
      ))
    );
  };

  // const Sections = useCallback(() => {
  //   const sectionGap = gapSize;
  //   return Array.from({ length: numCols - 1 }).map((_, i) => (
  //     <Section
  //       key={i}
  //       custom={i}
  //       fill={"#121212"}
  //       position={[gridWidth * i + gridWidth + sectionGap / 3, 0]}
  //       height={dimensions.height}
  //       width={gridWidth - (sectionGap * 2) / 3}
  //       opacity={0.1}
  //     />
  //   ));
  // }, [dimensions.height, gapSize, gridWidth, numCols]);

  return (
    <motion.svg
      id={"mask"}
      {...svgProps}
      ref={ref}
      className={"z-unitSize0 absolute left-0 top-0 h-full w-full opacity-100"}
    >
      <VerticalLines />
      <HorizontalLines />
      <Vertexs />
      {/* </motion.mask> */}
    </motion.svg>
  );
};

GridEffect.displayName = "Grid";

export default GridEffect;
