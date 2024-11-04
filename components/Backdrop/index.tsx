"use client";

import {
  MotionValue,
  m,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
} from "framer-motion";

import { GridContext } from "@/lib/providers/clientState";
import { FC, useCallback, useContext, useEffect, useRef } from "react";
import { useStore } from "zustand";
import { moveCursorEffect } from "../Grid/util";
import Vertex from "./Vertex";

const GridBackdrop: FC<{ scrollY: MotionValue<number> }> = ({
  scrollY,
  ...props
}) => {
  const canvas = useRef<SVGSVGElement>(null);
  const baseX = useMotionValue(-100);
  const baseY = useMotionValue(-100);
  const x = useSpring(baseX, { stiffness: 250, damping: 30 });
  const y = useSpring(baseY, { stiffness: 250, damping: 30 });
  const store = useContext(GridContext)!;
  const { unitSize, vertexSize, gapSize } = store.getInitialState().gridInfo;
  const { containerHeight, width } = useStore(
    store,
    (store) => store.dimensions
  );
  const { ratio, numRows, numCols, gridCellSize } = useStore(store).gridInfo;

  const gridCols = numCols / unitSize;
  const gridRows = (numRows * ratio) / unitSize;
  const cellHeight = gridCellSize / ratio;

  const strokeDasharray = useCallback(
    (dimension: number) => {
      return `${dimension - gapSize} ${gapSize}`;
    },
    [gapSize]
  );
  // numRows & gridCellsize is based on width, and ratio is the cloest

  const updateAttribute = (dataAttr: string) => (latest: string) => {
    const canvasElem = canvas.current;
    if (canvasElem !== null) {
      (canvasElem as Element).setAttribute(dataAttr, `${latest}`);
      moveCursorEffect(canvasElem);
    }
  };

  useMotionValueEvent(x, "change", updateAttribute("data-circle-x"));
  useMotionValueEvent(y, "change", updateAttribute("data-circle-y"));

  // useEffect(() => {
  //   const canvasElem = canvas.current?.getBoundingClientRect();
  //   const followMouse = (e: { clientX: number; clientY: number }) => {
  //     baseX.set(e.clientX - (canvasElem?.left ?? 0));
  //     baseY.set(e.clientY - (canvasElem?.top ?? 0));
  //   };

  //   const followTouch = (e: TouchEvent) => {
  //     followMouse(e.touches[0]);
  //   };

  //   window.addEventListener("mousemove", followMouse);
  //   window.addEventListener("touchmove", followTouch);

  //   return () => {
  //     window.removeEventListener("mousemove", followMouse);
  //     window.removeEventListener("touchmove", followTouch);
  //   };
  // });

  useEffect(() => {
    updateAttribute("data-circle-radius")("64");
  }, []);

  useEffect(() => {
    const unsub = scrollY.on("change", (val) => {
      const canvasElem = canvas.current as Element;
      if (canvasElem) {
        canvasElem.setAttribute("data-offset", val.toString());
        moveCursorEffect(canvasElem as SVGSVGElement);
      }
    });
    return () => {
      unsub();
    };
  }, [scrollY]);

  // Function to calculate stroke properties
  const calculateStroke = (index: number, unitSize: number) => {
    return index % unitSize === 0
      ? "var(--accent-a9)"
      : index % 2 === 0
        ? "var(--accent-a6)"
        : "var(--accent-a3)";
  };

  // Generic Line Component
  const Lines = useCallback(
    (props: {
      isVertical: boolean;
      numLines: number;
      minorDimension: number;
      majorStep: number;
    }) => {
      const { isVertical, numLines, minorDimension, majorStep } = props;
      return Array.from({ length: numLines + 1 }).map((_, i) => (
        <line
          {...(isVertical
            ? {
                x1: i * majorStep,
                x2: i * majorStep,
                y1: 0,
                y2: minorDimension,
              }
            : {
                y1: i * majorStep,
                y2: i * majorStep,
                x1: 0,
                x2: minorDimension,
              })}
          key={i}
          strokeDashoffset={-gapSize / 2}
          strokeDasharray={
            i !== 0 && i !== numLines ? strokeDasharray(majorStep) : 0
          }
          stroke={calculateStroke(i, unitSize)}
        />
      ));
    },
    [gapSize, strokeDasharray, unitSize]
  );

  const VerticalLines = useCallback(() => {
    return (
      <Lines
        isVertical={true}
        numLines={gridCols}
        minorDimension={containerHeight}
        majorStep={gridCellSize}
      />
    );
  }, [gridCols, gridCellSize, containerHeight, Lines]);

  const HorizontalLines = useCallback(() => {
    return (
      <Lines
        isVertical={false}
        numLines={gridRows}
        minorDimension={width}
        majorStep={cellHeight}
      />
    );
  }, [gridRows, cellHeight, width, Lines]);

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
      )));
  };

  return (
    <m.div
      style={{ height: containerHeight }}
      className={
        "absolute top-0 left-0 -z-50 h-full w-full pointer-events-none"
      }
    >
      <m.svg
        id={"mask"}
        initial={{
          maskImage: "linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1))",
        }}
        {...props}
        ref={canvas}
        className={"mask absolute top-0 left-0 -z-50 h-full w-full opacity-100"}
      >
        <VerticalLines />
        <HorizontalLines />
        <Vertexs />
      </m.svg>
    </m.div>
  );
};

export default GridBackdrop;
