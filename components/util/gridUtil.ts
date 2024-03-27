import { GridInfo } from "@/lib/state";
import { CARD_TYPES } from "../Cards/types";

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
  threshold = 0
) => {
  const { gridCellHeight, gridCellWidth } = gridInfo;

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
    horizontalDistance < threshold + gridCellWidth &&
    verticalDistance < threshold + gridCellHeight
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
  const { gridCellHeight, gridCellWidth, bounds } = gridInfo;

  const elemArrs = Array.from(gridElements.values()).filter(
    (e) => e.id !== element.id
  );
  const wrapElement =
    displacingElem.width + displacingElem.coords[0] + element.width >
    bounds.right;
  element.coords[0] = wrapElement
    ? bounds.left + gridCellWidth
    : displacingElem.coords[0] + displacingElem.width + gridCellWidth;

  if (wrapElement) {
    const vertConflicting = elemArrs.filter(
      (conflictingRect) =>
        conflictingRect.coords[1] <= element.coords[1] &&
        isIntersecting(element, conflictingRect, gridInfo)
    );
    if (vertConflicting.length) {
      const tallestElem = vertConflicting.reduce((smallest, current) => {
        if (current.coords[1] <= smallest.coords[1]) {
          return current;
        }
        return smallest;
      }, vertConflicting[0]);
      element.coords[1] =
        tallestElem.coords[1] + tallestElem.height + gridCellHeight;
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
