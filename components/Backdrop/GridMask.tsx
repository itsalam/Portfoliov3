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
  const { height, width } = useStore(store, (store) => store.dimensions);
  const {
    numRows,
    numCols,
    gridCellHeight,
    gridCellWidth,
    vertexSize,
    gapSize,
  } = useStore(store).gridInfo;
  const ref = useRef<SVGSVGElement>(null);
  const strokeDasharray = useCallback(
    (dimension: number, factor: number) => {
      return `${(dimension * factor - gapSize).toFixed(2)} ${gapSize}`;
    },
    [gapSize]
  );

  const VerticalLines = useCallback(() => {
    const length = numCols / 4 + 1;
    return Array.from({ length }).map((_, i) => (
      <line
        x1={i * gridCellWidth * 4 + (i === 0 ? 1 : i === length - 1 ? -1 : 0)}
        x2={i * gridCellWidth * 4 + (i === 0 ? 1 : i === length - 1 ? -1 : 0)}
        y1={gapSize / 2}
        y2={height}
        key={i}
        strokeWidth={0.5}
        strokeDasharray={
          i !== 0 && i !== length
            ? strokeDasharray(gridCellHeight, i % 2 ? 4 : 4)
            : 0
        }
        strokeDashoffset={0}
        stroke={i % 4 === 0 ? "#777777" : i % 2 === 0 ? "#444444" : "#222222"}
      />
    ));
  }, [
    numCols,
    gridCellWidth,
    gapSize,
    height,
    strokeDasharray,
    gridCellHeight,
  ]);

  const HorizontalLines = useCallback(() => {
    return Array.from({ length: numRows / 4 + 1 }).map((_, i) => (
      <line
        y1={i * gridCellHeight * 4 + 1}
        y2={i * gridCellHeight * 4 + 1}
        x1={gapSize / 2}
        x2={width}
        key={i}
        strokeWidth={0.5}
        strokeDasharray={strokeDasharray(gridCellWidth, i % 2 ? 4 : 4)}
        strokeDashoffset={0}
        stroke={i % 4 === 0 ? "#777777" : i % 2 === 0 ? "#444444" : "#222222"}
      />
    ));
  }, [numRows, gridCellHeight, gapSize, width, strokeDasharray, gridCellWidth]);

  const Vertexs = () => {
    return Array.from({ length: numCols / 4 }).map((_, i) =>
      Array.from({ length: numRows / 4 }).map((_, j) => (
        <Vertex
          key={`${i}-${j}`}
          position={[(i + 1) * gridCellWidth * 4, (j + 1) * gridCellHeight * 4]}
          size={vertexSize}
          fill={
            (i + 1) % 4 === 0 && (j + 1) % 4 === 0
              ? "#ffffff"
              : (i + 1) % 2 === 0 && (j + 1) % 2 === 0
                ? "#666666"
                : "#232323"
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
      className={"absolute w-full h-full z-50 left-0 top-0 opacity-100"}
    >
      {/* <Sections /> */}
      {/* <motion.mask id="clipping"> */}
      {/* <Lines orientation="horizontal" />
        <Lines orientation="vertical" /> */}
      <VerticalLines />
      <HorizontalLines />
      <Vertexs />
      {/* </motion.mask> */}
    </motion.svg>
  );
};

GridEffect.displayName = "Grid";

export default GridEffect;
