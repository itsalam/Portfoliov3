import { GridInfo } from "@/lib/providers/clientState";
import { ReadonlyURLSearchParams } from "next/dist/client/components/navigation";
import { CARD_TYPES } from "../Cards/types";
import {
  CARD_MENU_GROUP,
  DEFAULT_GRID_ELEMENTS,
  DEFAULT_INIT_ELEMS,
  DefaultGridElement,
  GridElement,
  GridElements,
} from "./consts";

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
): GridElement => {
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
      isIntersecting(element, conflictingRect, gridInfo));
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
  initialCards?: CARD_TYPES[],
  webgl?: boolean
) => {
  const initElements = initialCards?.length ? initialCards : DEFAULT_INIT_ELEMS;
  const gridElements = new Map<CARD_TYPES, GridElement>();
  const otherElements = webgl
    ? [
        ...Object.values(CARD_MENU_GROUP)
          .flat()
          .filter(
            (e: CARD_TYPES) =>
              (webgl && CARD_MENU_GROUP.info.includes(e)) ||
              (!initElements.includes(e) && e !== CARD_TYPES.Contacts)
          ),
      ]
    : [];
  [...initElements, ...otherElements].forEach((id) => {
    let gridElem = getDefaultGridElement(id, gridInfo);
    gridElem = resolveIntersections(gridElem, gridElements, gridInfo);
    gridElements.set(id, gridElem);
  });
  return gridElements;
};

export const moveCursorEffect = (canvas: HTMLElement | SVGSVGElement) => {
  const yOffset = parseInt(canvas.getAttribute("data-offset") ?? "0");
  const radius = parseInt(canvas.getAttribute("data-circle-radius") ?? "0");
  const x = parseInt(canvas.getAttribute("data-circle-x") ?? "0");
  const y = parseInt(canvas.getAttribute("data-circle-y") ?? "0");
  canvas.style.maskImage = `radial-gradient(circle ${radius}px at ${x - radius / 2}px ${y + yOffset}px, white, transparent),  linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1))`;
};

export const getDefaultGridElement = (
  id: CARD_TYPES,
  gridInfo: GridInfo
): GridElement => {
  const defaultElem = DEFAULT_GRID_ELEMENTS[id];
  const { gridUnitSize, numCols } = gridInfo;
  const dimensions = getDefaultGridElementDimensions(gridInfo, defaultElem);
  return {
    ...defaultElem,
    coords: [
      defaultElem.initialCoords[0] * gridUnitSize,
      defaultElem.initialCoords[1] * gridUnitSize,
    ],
    width:
      Math.round(
        Math.min(gridUnitSize * (numCols - 2), dimensions?.width) / gridUnitSize
      ) * gridUnitSize,
    height: Math.round(dimensions?.height / gridUnitSize) * gridUnitSize,
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
  return element;
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

export const createQueryString = (
  name: string,
  value: string,
  searchParams: ReadonlyURLSearchParams
) => {
  const params = new URLSearchParams(searchParams.toString());
  params.set(name, value);

  return params.toString();
};

export const getDefaultGridElementDimensions = (
  gridInfo: GridInfo,
  defaultElem: DefaultGridElement
) => {
  const { isMobile, isWide } = gridInfo;
  return isMobile && defaultElem.mobileDimensions !== undefined
    ? defaultElem.mobileDimensions
    : isWide && defaultElem.wideDimensions !== undefined
      ? defaultElem.wideDimensions
      : defaultElem.initialDimensions;
};
