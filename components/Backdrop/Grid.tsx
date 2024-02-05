"use client";

import { Text } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { throttle } from "lodash";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Line from "./Line";
import Vertex from "./Vertex";

export type Dimensions = {
  width: number;
  height: number;
};

export type GridProps = {
  numCols?: number;
  numRows?: number;
  vertexSize?: number;
  gapRatio?: number;
  dotsPerGrid?: number;
};

const Grid: React.FC<GridProps> = (props) => {
  const {
    numCols = 48,
    numRows = 36,
    vertexSize = 9,
    gapRatio = 0.8,
    ...svgProps
  } = props;
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });
  const ref = useRef<SVGSVGElement>(null);
  const gapSize = useMemo(
    () => (1 + gapRatio) * vertexSize,
    [gapRatio, vertexSize]
  );
  const dashSize = useCallback((length: number) => length - gapSize, [gapSize]);

  const gridWidth = useMemo(
    () => dimensions.width / numCols,
    [dimensions.width, numCols]
  );

  const gridHeight = useMemo(
    () => dimensions.height / numRows,
    [dimensions.height, numRows]
  );

  const updateDimensions = throttle(
    useCallback(() => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }, []),
    50
  );

  const updateCssVars = throttle(
    useCallback(() => {
      const root = document.documentElement;
      root.style.setProperty("--grid-width", `${gridWidth * 4}px`);
      root.style.setProperty("--grid-height", `${gridHeight * 4}px`);
      root.style.setProperty("--x-padding", `${gapSize / 4}px`);
      root.style.setProperty("--y-padding", `${gapSize / 4}px`);
    }, [gapSize, gridHeight, gridWidth]),
    50
  );

  const updateSpecs = useCallback(() => {
    const handleResize = () => {
      updateDimensions();
      updateCssVars();
    };
    const cancel = () => {
      updateDimensions.cancel();
      updateCssVars.cancel();
    };
    return { handleResize, cancel };
  }, [updateDimensions, updateCssVars]);

  useEffect(() => {
    if (window !== undefined && !(dimensions.width && dimensions.height)) {
      updateDimensions();
    }
  }, [dimensions.height, dimensions.width, updateDimensions]);

  useEffect(() => {
    updateCssVars();
  }, [updateCssVars]);

  useEffect(() => {
    const { cancel, handleResize } = updateSpecs();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancel();
    };
  }, [updateSpecs, dimensions]);

  const Lines = useCallback(
    (props: { orientation: "vertical" | "horizontal" }) => {
      const { orientation } = props;
      const isVertical = orientation === "vertical";
      const length = dimensions[isVertical ? "height" : "width"];
      const numLines = isVertical ? numCols : numRows;
      const strokeDasharray = (factor) =>
        isVertical
          ? `${dashSize(gridHeight * factor)} ${gapSize}`
          : `${dashSize(gridWidth * factor)} ${gapSize}`;
      const setCoords = (i: number) => {
        if (isVertical) {
          const xPos = i * gridWidth;
          return {
            x1: xPos,
            y1: gapSize / 2,
            x2: xPos,
            y2: length,
          };
        } else {
          const yPos = i * gridHeight;
          return {
            x1: gapSize / 2,
            y1: yPos,
            x2: length,
            y2: yPos,
          };
        }
      };

      return Array.from({ length: numLines + 1 }).map((_, i) => (
        <Line
          {...{ length, orientation }}
          key={i}
          custom={i}
          {...setCoords(i)}
          strokeDasharray={strokeDasharray(i % 2 ? 1 : 2)}
          strokeDashoffset={0}
          fill={i % 4 === 0 ? "#CCCCCC" : i % 2 === 0 ? "#666666" : "#222222"}
        />
      ));
    },
    [dashSize, dimensions, gapSize, gridHeight, gridWidth, numCols, numRows]
  );

  const Vertexs = useCallback(() => {
    const [x, y] = [numCols, numRows];

    return Array.from({ length: x }).map((_, i) =>
      Array.from({ length: y }).map((_, j) => (
        <Vertex
          custom={i + j}
          key={`${i}-${j}`}
          position={[i * gridWidth, j * gridHeight]}
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
  }, [numCols, numRows, gridWidth, gridHeight, vertexSize]);

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
      className={"absolute w-screen h-screen"}
    >
      {/* <Sections /> */}
      <motion.mask id="clipping">
        <Lines orientation="horizontal" />
        <Lines orientation="vertical" />
        <Vertexs />
      </motion.mask>
      <Text asChild>
        <text
          x={gridWidth}
          y={gridHeight * (numRows - 1)}
          color="white"
          fill="white"
          className="font-favorit"
        >
          {`${dimensions.width} x ${dimensions.height}`}
        </text>
      </Text>
    </motion.svg>
  );
};

Grid.displayName = "Grid";

export default Grid;
