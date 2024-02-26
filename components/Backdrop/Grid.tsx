"use client";

import { dimensionAtom, gridAtom } from "@/lib/state";
import { motion } from "framer-motion";
import { useAtomValue } from "jotai";
import React, { useCallback, useRef } from "react";
import Vertex from "./Vertex";

export type GridProps = {
  numCols?: number;
  numRows?: number;
  vertexSize?: number;
  gapRatio?: number;
  dotsPerGrid?: number;
};

const Grid: React.FC<GridProps> = (props) => {
  const { numCols = 48, numRows = 36, ...svgProps } = props;
  const { height, width } = useAtomValue(dimensionAtom);
  const { gridCellHeight, gridCellWidth, vertexSize, gapSize } =
    useAtomValue(gridAtom);
  const ref = useRef<SVGSVGElement>(null);
  const strokeDasharray = useCallback(
    (dimension: number, factor: number) => {
      return `${(dimension * factor - gapSize).toFixed(2)} ${gapSize}`;
    },
    [gapSize]
  );

  const VerticalLines = useCallback(() => {
    return Array.from({ length: numCols + 1 }).map((_, i) => (
      <line
        x1={i * gridCellWidth}
        x2={i * gridCellWidth}
        y1={gapSize / 2}
        y2={height}
        key={i}
        strokeWidth={0.5}
        strokeDasharray={strokeDasharray(gridCellHeight, i % 2 ? 1 : 2)}
        strokeDashoffset={0}
        stroke={i % 4 === 0 ? "#CCCCCC" : i % 2 === 0 ? "#777777" : "#222222"}
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
    return Array.from({ length: numRows + 1 }).map((_, i) => (
      <line
        y1={i * gridCellHeight}
        y2={i * gridCellHeight}
        x1={gapSize / 2}
        x2={width}
        key={i}
        strokeWidth={0.5}
        strokeDasharray={strokeDasharray(gridCellWidth, i % 2 ? 1 : 2)}
        strokeDashoffset={0}
        stroke={i % 4 === 0 ? "#777777" : i % 2 === 0 ? "#444444" : "#222222"}
      />
    ));
  }, [numRows, gridCellHeight, gapSize, width, strokeDasharray, gridCellWidth]);

  const Vertexs = useCallback(() => {
    return Array.from({ length: numCols }).map((_, i) =>
      Array.from({ length: numRows }).map((_, j) => (
        <Vertex
          key={`${i}-${j}`}
          position={[i * gridCellWidth, j * gridCellHeight]}
          size={vertexSize}
          fill={
            i % 4 === 0 && j % 4 === 0
              ? "#ffffff"
              : i % 2 === 0 && j % 2 === 0
                ? "#666666"
                : "#23232300"
          }
        />
      ))
    );
  }, [numCols, numRows, gridCellWidth, gridCellHeight, vertexSize]);

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
      layout
      {...svgProps}
      ref={ref}
      className={"absolute w-screen h-screen z-50 top-0"}
    >
      {/* <Sections /> */}
      <motion.mask id="clipping">
        {/* <Lines orientation="horizontal" />
        <Lines orientation="vertical" /> */}
        <VerticalLines />
        <HorizontalLines />
        <Vertexs />
      </motion.mask>
      {/* <Text asChild>
        <text
          x={gridCellWidth}
          y={gridCellHeight * (numRows - 1)}
          color="white"
          fill="white"
          className="font-favorit"
        >
          {`${dimensions.width} x ${dimensions.height}`}
        </text>
      </Text> */}
    </motion.svg>
  );
};

Grid.displayName = "Grid";

export default Grid;
