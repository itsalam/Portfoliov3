"use client";

import { GridContext } from "@/lib/state";
import { MotionValue, motion } from "framer-motion";
import React, { useCallback, useContext, useEffect, useRef } from "react";
import { useStore } from "zustand";
import { moveCursorEffect } from "../Grid/util";
import Effect from "./Effect";
import Vertex from "./Vertex";

export type GridProps = {
  scrollY: MotionValue<number>;
};

const GridEffect: React.FC<GridProps> = (props) => {
  const { scrollY, ...svgProps } = props;

  const store = useContext(GridContext)!;
  const { unitSize, vertexSize, gapSize } = store.getInitialState().gridInfo;
  const { containerHeight, width } = useStore(
    store,
    (store) => store.dimensions
  );
  const { ratio, numRows, numCols, gridCellSize } = useStore(store).gridInfo;
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

  useEffect(() => {
    const unsub = scrollY.on("change", (val) => {
      if (ref.current) {
        ref.current.setAttribute("data-offset", val.toString());
        moveCursorEffect(ref.current);
      }
    });
    return () => {
      unsub();
    };
  }, [scrollY]);

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
          i % unitSize === 0
            ? "var(--accent-a9)"
            : i % 2 === 0
              ? "var(--accent-a6)"
              : "var(--accent-a3)"
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
          i % unitSize === 0
            ? "var(--accent-a9)"
            : i % 2 === 0
              ? "var(--accent-a6)"
              : "var(--accent-a3)"
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
          thickness={
            (i + 1) % unitSize === 0 && (j + 1) % unitSize === 0 ? 1 : 0.8
          }
          key={`${i}-${j}`}
          position={[(i + 1) * gridCellSize, (j + 1) * cellHeight]}
          size={vertexSize}
          fill={
            (i + 1) % unitSize === 0 && (j + 1) % unitSize === 0
              ? "var(--accent-a12)"
              : (i + 1) % 2 === 0 && (j + 1) % 2 === 0
                ? "var(--accent-a9)"
                : "var(--accent-a6)"
          }
        />
      ))
    );
  };

  return (
    <>
      <motion.svg
        id={"mask"}
        initial={{
          maskImage: "linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1))",
        }}
        {...svgProps}
        ref={ref}
        className={"mask absolute left-0 top-0 z-40 h-full w-full opacity-100"}
      >
        <VerticalLines />
        <HorizontalLines />
        <Vertexs />
      </motion.svg>
      <Effect />
    </>
  );
};

GridEffect.displayName = "Grid";

export default GridEffect;
