import { GridInfo } from "@/lib/state";
import { ReadonlyURLSearchParams } from "next/dist/client/components/navigation";
import { CARD_TYPES } from "../Cards/types";
import {
  DEFAULT_GRID_ELEMENTS,
  DEFAULT_INIT_ELEMS,
  GRID_QUERY_KEY,
} from "./consts";

export type GridElement = {
  id: CARD_TYPES;
  coords: [number, number];
  hasPositioned?: boolean;
  width: number;
  height: number;
  isLocked?: boolean;
};

export const isIntersecting = (
  rectA: GridElement,
  rectB: GridElement,
  gridInfo: GridInfo,
  threshold = 0.9
) => {
  const { gridUnitSize } = gridInfo;

  // Calculate horizontal and vertical distances between the edges of the rectangles
  const horizontalDistance = Math.max(
    rectA.coords[0] - (rectB.coords[0] + rectB.width),
    rectB.coords[0] - (rectA.coords[0] + rectA.width),
    0 // Ensure the distance is not negative
  );

  const verticalDistance = Math.max(
    rectA.coords[1] - (rectB.coords[1] + rectB.height),
    rectB.coords[1] - (rectA.coords[1] + rectA.height),
    0 // Ensure the distance is not negative
  );

  // Check if either horizontal or vertical distance is within the threshold
  return (
    horizontalDistance < threshold * gridUnitSize &&
    verticalDistance < threshold * gridUnitSize
  );
};

export const placeNewRect = (
  e: GridElement,
  gridElements: Map<CARD_TYPES, GridElement>,
  gridInfo: GridInfo
): GridElement => {
  if (e.isLocked) return e;
  const lockedElemArrs = Array.from(gridElements.values()).filter(
    (lockedElem) => lockedElem.isLocked && lockedElem.id !== e.id
  );

  const getConflictingRect = (e: GridElement) =>
    lockedElemArrs.find((lockedElem) =>
      isIntersecting(e, lockedElem, gridInfo)
    );
  let lockedConflictingRect = getConflictingRect(e);
  while (lockedConflictingRect) {
    e = placeNewPosition(e, lockedConflictingRect, gridElements, gridInfo);
    lockedConflictingRect = getConflictingRect(e);
  }

  return e;
};

export const resolveIntersections = (
  elem: GridElement,
  gridElements: Map<CARD_TYPES, GridElement>,
  gridInfo: GridInfo,
  swap?: boolean
) => {
  const elemArrs = Array.from(gridElements.values());
  const elems: GridElement[] = elemArrs.filter((e) => e.id !== elem.id);
  let hasIntersections;
  do {
    hasIntersections = false;
    elems
      .map((displacedRect) => {
        if (isIntersecting(elem, displacedRect, gridInfo)) {
          displacedRect = placeNewPosition(
            swap ? displacedRect : elem,
            swap ? elem : displacedRect,
            gridElements,
            gridInfo
          );
          gridElements.set(displacedRect.id, displacedRect);
          hasIntersections = true;
          resolveIntersections(displacedRect, gridElements, gridInfo, swap);

          return displacedRect;
        }
        return null;
      })
      .filter(Boolean) as GridElement[];
  } while (hasIntersections);
  return gridInfo;
};

const placeNewPosition = (
  element: GridElement,
  displacingElem: GridElement,
  gridElements: Map<CARD_TYPES, GridElement>,
  gridInfo: GridInfo
) => {
  const { gridUnitSize, bounds } = gridInfo;

  const elemArrs = Array.from(gridElements.values()).filter(
    (e) => e.id !== element.id
  );
  const wrapElement =
    displacingElem.width + displacingElem.coords[0] + element.width >
    bounds.right;
  element.coords[0] = wrapElement
    ? bounds.left + gridUnitSize
    : displacingElem.coords[0] + displacingElem.width + gridUnitSize + 1;
  console.log({ element, wrapElement });
  if (wrapElement) {
    const vertConflicting = elemArrs.filter((conflictingRect) =>
      isIntersecting(element, conflictingRect, gridInfo)
    );
    if (vertConflicting.length) {
      const lowest = vertConflicting.reduce((lowest, current) => {
        if (
          current.coords[1] + current.height >
          lowest.coords[1] + lowest.height
        ) {
          return current;
        }
        return lowest;
      }, vertConflicting[0]);
      console.log({ tallestElem: lowest, vertConflicting });
      element.coords[1] = lowest.coords[1] + lowest.height + gridUnitSize;
    }
  }
  return element;
};

export const elementInBounds = (gridElem: GridElement, gridInfo: GridInfo) => {
  const { bounds } = gridInfo;
  return (
    gridElem.coords[0] >= bounds.left &&
    gridElem.coords[0] + gridElem.width <= bounds.right &&
    gridElem.coords[1] >= bounds.top &&
    gridElem.coords[1] + gridElem.height <= bounds.bottom
  );
};

export const initializeGridElements = (
  gridInfo: GridInfo,
  searchParams: ReadonlyURLSearchParams
) => {
  const searchParamElems = searchParams
    .get(GRID_QUERY_KEY)
    ?.split(",") as CARD_TYPES[];
  const initElements =
    searchParamElems && searchParamElems.every((elem) => CARD_TYPES[elem])
      ? searchParamElems
      : DEFAULT_INIT_ELEMS;

  const gridElements = new Map<CARD_TYPES, GridElement>();
  initElements.forEach((id) => {
    const e = DEFAULT_GRID_ELEMENTS[id];
    const { gridUnitSize, gridCellSize } = gridInfo;
    let gridElem = {
      ...e,
      coords: [e.coords[0] * gridUnitSize, e.coords[1] * gridUnitSize],
      width: e.width * gridCellSize,
      height: e.height * gridCellSize,
    } as GridElement;

    gridElem = placeNewRect(gridElem, gridElements, gridInfo);
    gridElements.set(id, { ...gridElem, hasPositioned: true });
    resolveIntersections(gridElem, gridElements, gridInfo);
  });

  return gridElements;
};

export const moveCursorEffect = (canvas: HTMLElement) => {
  const yOffset = parseInt(canvas.getAttribute("data-offset") ?? "0");
  const radius = parseInt(canvas.getAttribute("data-circle-radius") ?? "0");
  const x = parseInt(canvas.getAttribute("data-circle-x") ?? "0");
  const y = parseInt(canvas.getAttribute("data-circle-y") ?? "0");
  canvas.style.maskImage = `radial-gradient(circle ${radius}px at ${x}px ${y + yOffset}px, white, transparent)`;
};
