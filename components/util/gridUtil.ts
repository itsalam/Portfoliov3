import { Grid } from "@/lib/state";
import { ReactNode } from "react";
import { CARD_TYPES } from "../Cards/types";

export type GridElement = {
  id: CARD_TYPES;
  coords: [number, number];
  hasPositioned?: boolean;
  width: number;
  height: number;
  node: ReactNode;
  isLocked?: boolean;
};

export const checkIntersect = (
  rectA: GridElement,
  rectB: GridElement,
  gridInfo: Grid
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
  gridInfo: Grid
): GridElement => {
  const elem = document.querySelector(`#${e.id}`);
  const rect = elem!.getBoundingClientRect().toJSON();
  let gridElem = {
    ...e,
    width: rect.width,
    height: rect.height,
  } as GridElement;

  const lockedElemArrs = Array.from(gridElements.values()).filter(
    (e) => e.isLocked && e.id !== gridElem.id
  );

  const getConflictingRect = () =>
    lockedElemArrs.find((lockedElem) =>
      checkIntersect(gridElem, lockedElem, gridInfo)
    );
  let lockedConflictingRect = getConflictingRect();
  while (lockedConflictingRect) {
    gridElem = placeElement(
      gridElem,
      lockedConflictingRect,
      gridElements,
      gridInfo
    );
    lockedConflictingRect = getConflictingRect();
  }
  return gridElem;
};

export const moveDisplacedRects = (
  elem: GridElement,
  gridElements: Map<CARD_TYPES, GridElement>,
  gridInfo: Grid
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
  gridInfo: Grid
) => {
  const { gridCellHeight, gridCellWidth, bounds } = gridInfo;

  const elemArrs = Array.from(gridElements.values()).filter(
    (e) => e.id !== element.id
  );
  const wrapElement =
    displacingElem.width +
      displacingElem.coords[0] +
      gridCellWidth +
      element.width >
    bounds.x[1];
  element.coords[0] = wrapElement
    ? bounds.x[0]
    : displacingElem.coords[0] + displacingElem.width + gridCellWidth;

  if (wrapElement) {
    const vertConflicting = elemArrs.filter(
      (conflictingRect) =>
        conflictingRect.coords[1] <= element.coords[1] &&
        checkIntersect(element, conflictingRect, gridInfo)
    );
    if (vertConflicting.length) {
      const tallestElem = vertConflicting.reduce((smallest, current) => {
        if (
          current.coords[1] + current.height <=
          smallest.coords[1] + smallest.height
        ) {
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
