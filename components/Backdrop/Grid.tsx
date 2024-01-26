import { motion } from "framer-motion";
import { debounce } from "lodash";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Line from "./Line";
import Vertex from "./Vertex";
import Section from "./Sections";

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
    numCols = 24,
    numRows = 18,
    vertexSize = 9,
    gapRatio = 0.8,
    ...svgProps
  } = props;
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const ref = useRef<SVGSVGElement>(null);
  const gapSize = useMemo(
    () => (1 + gapRatio) * vertexSize,
    [gapRatio, vertexSize]
  );
  const dashSize = (length: number) => length - gapSize;

  const gridWidth = useMemo(
    () => Math.ceil(dimensions.width / numCols),
    [dimensions.width, numCols]
  );

  const gridHeight = useMemo(
    () => Math.ceil(dimensions.height / numRows),
    [dimensions.height, numRows]
  );

  const updateDimensions = useCallback(() => {
    if (ref.current) {
      const { width, height } = ref.current.getBoundingClientRect();
      if (width > dimensions.width || height > dimensions.height) {
        setDimensions({ width, height });
      }
    }
    const root = document.documentElement;
    root.style.setProperty("--grid-width", `${gridWidth * 2}px`);
    root.style.setProperty("--grid-height", `${gridHeight * 2}px`);
    root.style.setProperty("--x-padding", `${gapSize / 2}px`);
    root.style.setProperty("--y-padding", `${gapSize / 2}px`);
  }, [dimensions.height, dimensions.width, gapSize, gridHeight, gridWidth]);

  const debouncedUpdateDimensions = useRef(
    debounce(updateDimensions, 200)
  ).current;

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", debouncedUpdateDimensions);

    return () => {
      window.removeEventListener("resize", debouncedUpdateDimensions);
      debouncedUpdateDimensions.cancel();
    };
  }, [debouncedUpdateDimensions, updateDimensions]);

  const Lines = (props: { orientation: "vertical" | "horizontal" }) => {
    const { orientation } = props;
    const isVertical = orientation === "vertical";
    const length = dimensions[isVertical ? "height" : "width"];
    const numLines = isVertical ? numCols : numRows;
    const strokeDasharray = isVertical
      ? `${dashSize(gridHeight)} ${gapSize}`
      : `${dashSize(gridWidth)} ${gapSize}`;

    const strokeDashoffset = gapSize / 2;
    const setCoords = (i: number) => {
      if (isVertical) {
        const xPos = Math.floor(i * gridWidth);
        return {
          x1: xPos,
          y1: gapSize / 2,
          x2: xPos,
          y2: dimensions.height,
        };
      } else {
        const yPos = Math.floor(i * gridHeight);
        return {
          x1: gapSize / 2,
          y1: yPos,
          x2: dimensions.width,
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
        strokeDasharray={strokeDasharray}
        strokeDashoffset={0}
        fill={i % 2 ? "#777777" : "#232323"}
      />
    ));
  };

  const Vertexs = useCallback(() => {
    const [x, y] = [numCols, numRows];

    return Array.from({ length: x }).map((_, i) =>
      Array.from({ length: y }).map((_, j) => (
        <Vertex
          custom={i + j}
          key={`${i}-${j}`}
          position={[(i + 1) * gridWidth, (j + 1) * gridHeight]}
          size={vertexSize}
          fill={i % 2 && j % 2 ? "#ffffff" : "#777777"}
        />
      ))
    );
  }, [numCols, numRows, gridWidth, gridHeight, vertexSize]);

  const Sections = useCallback(() => {
    const sectionGap = gapSize;
    return Array.from({ length: numCols - 1 }).map((_, i) => (
      <Section
        key={i}
        custom={i}
        fill={"#121212"}
        position={[gridWidth * i + gridWidth + sectionGap / 3, 0]}
        height={dimensions.height}
        width={gridWidth - (sectionGap * 2) / 3}
        opacity={0.1}
      />
    ));
  }, [dimensions.height, gapSize, gridWidth, numCols]);

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
    </motion.svg>
  );
};

Grid.displayName = "Grid";

export default Grid;
