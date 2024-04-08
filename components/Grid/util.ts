import { GridInfo } from "@/lib/state";
import { ReadonlyURLSearchParams } from "next/dist/client/components/navigation";
import { CARD_TYPES } from "../Cards/types";
import {
  DEFAULT_GRID_ELEMENTS,
  DEFAULT_INIT_ELEMS,
  GRID_QUERY_KEY,
  GridElements,
} from "./consts";

export type DefaultGridElement = {
  id: CARD_TYPES;
  initialCoords: [number, number];
  initialWidth: number;
  initialHeight: number;
};

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

export const resolveIntersections = (
  elem: GridElement,
  gridElements: GridElements,
  gridInfo: GridInfo,
  swap?: boolean
) => {
  const elemArrs = Array.from(gridElements.values());
  const elems: GridElement[] = elemArrs.filter(
    (e) => e.id !== elem.id && e.hasPositioned
  );
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

          displacedRect = resolveIntersections(
            displacedRect,
            gridElements,
            gridInfo,
            swap
          );

          return displacedRect;
        }
        return null;
      })
      .filter(Boolean) as GridElement[];
  } while (hasIntersections);
  elem.hasPositioned = true;
  return elem;
};

const placeNewPosition = (
  element: GridElement,
  displacingElem: GridElement,
  gridElements: GridElements,
  gridInfo: GridInfo
) => {
  const { gridUnitSize, bounds } = gridInfo;

  const elemArrs = Array.from(gridElements.values()).filter(
    (e) => e.id !== element.id && e.hasPositioned
  );
  const wrapElement =
    displacingElem.width + displacingElem.coords[0] + element.width >
    bounds.right;
  element.coords[0] = wrapElement
    ? bounds.left + gridUnitSize
    : displacingElem.coords[0] + displacingElem.width + gridUnitSize + 1;
  if (wrapElement) {
    // element.coords[1] =

    const vertConflicting = elemArrs.filter((conflictingRect) =>
      // conflictingRect.coords[1] <= element.coords[1] &&
      isIntersecting(element, conflictingRect, gridInfo)
    );
    // console.log(vertConflicting);
    if (vertConflicting.length) {
      const tallest = vertConflicting.reduce((lowest, current) => {
        if (
          current.coords[1] + current.height <
          lowest.coords[1] + lowest.height
        ) {
          return current;
        }
        return lowest;
      }, displacingElem);
      element.coords[1] = tallest.coords[1] + tallest.height + gridUnitSize;
    }
  }
  return element;
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
    let gridElem = getDefaultGridElement(id, gridInfo);
    gridElem = resolveIntersections(gridElem, gridElements, gridInfo);
    gridElements.set(id, gridElem);
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

export const getDefaultGridElement = (
  id: CARD_TYPES,
  gridInfo: GridInfo
): GridElement => {
  const defaultElem = DEFAULT_GRID_ELEMENTS[id];
  if (id === CARD_TYPES.Home) {
    console.log(defaultElem);
  }
  const { gridUnitSize, bounds } = gridInfo;
  return {
    ...defaultElem,
    coords: [
      defaultElem.initialCoords[0] * gridUnitSize,
      defaultElem.initialCoords[1] * gridUnitSize,
    ],
    width:
      Math.round(
        Math.min(bounds.right - bounds.left, defaultElem.initialWidth) /
          gridUnitSize
      ) * gridUnitSize,
    height: Math.round(defaultElem.initialHeight / gridUnitSize) * gridUnitSize,
  };
};

export const updateDraggedElement = (
  id: CARD_TYPES,
  gridElements: GridElements
) => {
  const element = gridElements.get(id);
  if (!element) return;
  const transform = (document.querySelector(`#${element.id}`) as HTMLElement)
    ?.style?.transform;
  if (transform) {
    let translateX = 0;
    let translateY = 0;

    // Extracting translate values from the transform string

    const matches = transform.match(/-?\d+\.?\d*px/g);
    if (matches) {
      translateX = parseFloat(matches[0]);
      translateY = parseFloat(matches[1]);
    }

    element.coords = [translateX, translateY];
    gridElements.set(element.id, element);
  }
};

export const binpackElements = (
  gridElements: GridElements,
  gridInfo: GridInfo
) => {
  gridElements.forEach((element: GridElement) => {
    const { coords } = getDefaultGridElement(element.id, gridInfo);
    gridElements.set(element.id, { ...element, coords, hasPositioned: false });
  });

  gridElements.forEach((element: GridElement) => {
    gridElements.set(
      element.id,
      resolveIntersections(element, gridElements, gridInfo)
    );
  });

  // console.log(JSON.parse(JSON.stringify([...gridElements.values()])));
};
