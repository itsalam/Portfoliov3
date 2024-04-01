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
  const { height, width } = useStore(store, (store) => store.dimensions);
  const { ratio, numRows, numCols, gridCellSize, gridUnitSize } =
    useStore(store).gridInfo;
  const ref = useRef<SVGSVGElement>(null);
  const strokeDasharray = useCallback(
    (dimension: number, factor: number) => {
      return `${(dimension * factor - gapSize).toFixed(2)} ${gapSize}`;
    },
    [gapSize]
  );

  const VerticalLines = useCallback(() => {
    const length = numCols / unitSize + 1;
    return Array.from({ length }).map((_, i) => (
      <line
        x1={i * gridCellSize + (i === 0 ? 1 : i === length - 1 ? -1 : 0)}
        x2={i * gridCellSize + (i === 0 ? 1 : i === length - 1 ? -1 : 0)}
        y1={gapSize / 2}
        y2={height}
        key={i}
        strokeWidth={0.5}
        strokeDasharray={
          i !== 0 && i !== length
            ? strokeDasharray(gridUnitSize, i % 2 ? unitSize : unitSize)
            : 0
        }
        strokeDashoffset={0}
        stroke={
          i % unitSize === 0 ? "#aaaaaa" : i % 2 === 0 ? "#777777" : "#555555"
        }
      />
    ));
  }, [
    numCols,
    unitSize,
    gridCellSize,
    gapSize,
    height,
    strokeDasharray,
    gridUnitSize,
  ]);

  const HorizontalLines = useCallback(() => {
    return Array.from({ length: (numRows * ratio) / unitSize + 1 }).map(
      (_, i) => (
        <line
          y1={(i * gridCellSize) / ratio + 1}
          y2={(i * gridCellSize) / ratio + 1}
          x1={gapSize / 2}
          x2={width}
          key={i}
          strokeWidth={0.5}
          strokeDasharray={strokeDasharray(
            gridUnitSize,
            i % 2 ? unitSize : unitSize
          )}
          strokeDashoffset={0}
          stroke={
            i % unitSize === 0 ? "#aaaaaa" : i % 2 === 0 ? "#777777" : "#555555"
          }
        />
      )
    );
  }, [
    numRows,
    ratio,
    unitSize,
    gridCellSize,
    gapSize,
    width,
    strokeDasharray,
    gridUnitSize,
  ]);

  const Vertexs = () => {
    return Array.from({ length: numCols / unitSize }).map((_, i) =>
      Array.from({ length: (numRows * ratio) / unitSize }).map((_, j) => (
        <Vertex
          key={`${i}-${j}`}
          position={[(i + 1) * gridCellSize, ((j + 1) * gridCellSize) / ratio]}
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
