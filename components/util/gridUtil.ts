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

export const checkIntersect = (
  rectA: GridElement,
  rectB: GridElement,
  gridInfo: GridInfo
) => {
  const { gridCellHeight, gridCellWidth } = gridInfo;

  return !(
    (
      rectA.coords[0] >= rectB.coords[0] + rectB.width + gridCellWidth || // rectA is right of rectB (with padding)
      rectA.coords[0] + rectA.width <= rectB.coords[0] - gridCellWidth || // rectA is left of rectB (with padding)
      rectA.coords[1] >= rectB.coords[1] + rectB.height + gridCellHeight || // rectA is below rectB (with padding)
      rectA.coords[1] + rectA.height <= rectB.coords[1] - gridCellHeight
    ) // rectA is above rectB (with padding)
  );
};

export const placeUnpositionedRect = (
  e: GridElement,
  gridElements: Map<CARD_TYPES, GridElement>,
  gridInfo: GridInfo
): GridElement => {
  const lockedElemArrs = Array.from(gridElements.values()).filter(
    (lockedElem) => lockedElem.isLocked && lockedElem.id !== e.id
  );

  const getConflictingRect = (e: GridElement) =>
    lockedElemArrs.find((lockedElem) =>
      checkIntersect(e, lockedElem, gridInfo)
    );

  let lockedConflictingRect = getConflictingRect(e);
  while (lockedConflictingRect) {
    e = placeElement(e, lockedConflictingRect, gridElements, gridInfo);
    lockedConflictingRect = getConflictingRect(e);
  }
  return e;
};

export const moveDisplacedRects = (
  elem: GridElement,
  gridElements: Map<CARD_TYPES, GridElement>,
  gridInfo: GridInfo
): GridElement[] => {
  const elemArrs = Array.from(gridElements.values());
  const positionedElems: GridElement[] = elemArrs.filter(
    (e) => e.id !== elem.id
  );

  return positionedElems
    .filter((e) => !e.isLocked)
    .map((displacedRect) => {
      if (checkIntersect(elem, displacedRect, gridInfo)) {
        displacedRect = placeElement(
          displacedRect,
          elem,
          gridElements,
          gridInfo
        );
        return placeUnpositionedRect(displacedRect, gridElements, gridInfo);
      }
      return null;
    })
    .filter(Boolean) as GridElement[];
};

const placeElement = (
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
        checkIntersect(element, conflictingRect, gridInfo)
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
