import { GridInfo, GridStore } from "@/lib/providers/clientState";
import { isWebGLSupported } from "@/lib/providers/clientUtils";
import { debounce } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { StoreApi } from "zustand";
import { CARD_TYPES } from "../Cards/types";
import { GridElement, GridElements, SCROLL_TO_CARD_DELAY } from "./consts";
import {
  binpackElements,
  getDefaultGridElement,
  initializeGridElements,
} from "./util";

export const useGrid = (context: StoreApi<GridStore>) => {
  const webgl = isWebGLSupported();
  const { addListener, toggleCard, initialCards } = context.getInitialState();
  const { activeCard, gridInfo, dimensions } = context.getState();
  const gridInfoRef = useRef<GridInfo>(gridInfo);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [gridElements, setGridElements] = useState<GridElements>(() => {
    const elemMap = initializeGridElements(
      gridInfoRef.current,
      initialCards,
      webgl
    );
    // elemMap.delete(CARD_TYPES.Location);
    return elemMap;
  });

  const adjustElements = useCallback((gridInfo: GridInfo) => {
    setGridElements((gridElements: GridElements) => {
      const newGridElements = new Map(gridElements); // Clone to ensure immutability
      newGridElements.forEach((element) => {
        const { width, height, coords } = getDefaultGridElement(
          element.id,
          gridInfo
        );
        newGridElements.set(element.id, {
          ...element,
          coords,
          hasPositioned: false,
          width,
          height,
        });
      });
      binpackElements(newGridElements, gridInfo);
      return newGridElements;
    });
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const scrollToGridElement = useCallback(
    debounce(
      (gridElement: GridElement, delay = 100) => {
        return new Promise<void>((res) =>
          setTimeout(() => {
            scrollAreaRef.current?.scrollTo({
              top: Math.max(
                0,
                gridElement.coords[1] - gridInfoRef.current.gridUnitSize
              ),
              behavior: "smooth",
            });
            res();
          }, delay));
      },
      SCROLL_TO_CARD_DELAY,
      { trailing: true }
    ),
    []
  );

  const pushElements = useCallback(
    (gridInfo: GridInfo, gridElements: GridElements) => (ids: CARD_TYPES[]) => {
      // On basic view, immediately move to other card
      if (activeCard) {
        const newGridElements = new Map();
        if (ids.includes(activeCard)) {
          return;
        } else {
          ids.forEach((id) => {
            const gridElem = getDefaultGridElement(id, gridInfo);
            newGridElements.set(id, gridElem);
            if (gridElem?.canExpand) {
              toggleCard(id);
            }
          });
        }
        setGridElements(newGridElements);
        return;
      }
      //if there is an active card, return to main view
      if (activeCard) {
        toggleCard(null);

        if (ids.includes(activeCard)) {
          return;
        }
      }

      //otherwise, find first element that can expand and toggle it.
      setTimeout(
        () =>
          ids
            .filter((id) => {
              return id !== CARD_TYPES.Location;
            })
            .forEach((id) => {
              const gridElem = gridElements.get(id);
              if (gridElem) {
                if (gridElem.canExpand) {
                  toggleCard(gridElem.id);
                }
              } else {
                gridElements.set(id, getDefaultGridElement(id, gridInfo));
                setGridElements(new Map(gridElements));
                adjustElements(gridInfoRef.current);
              }
            }),
        0
      );
    },
    [activeCard, toggleCard, adjustElements]
  );

  const closeElements = useCallback(
    (gridElements: GridElements) => (ids: CARD_TYPES[]) => {
      ids.forEach((id) => {
        const elem = gridElements.get(id);
        if (elem) {
          gridElements.delete(id);
        }
      });
      setGridElements(new Map(gridElements));
      adjustElements(gridInfoRef.current);
    },
    [adjustElements]
  );

  useEffect(() => {
    const gridInfo = gridInfoRef.current;
    const removeListener = addListener({
      dispatch: setGridElements,
      pushElements: pushElements(gridInfo, gridElements),
      closeElements: closeElements(gridElements),
    });
    return () => removeListener();
  }, [
    addListener,
    closeElements,
    gridElements,
    gridInfoRef,
    pushElements,
    setGridElements,
  ]);

  useEffect(() => {
    console.log({ gridInfo, dimensions, adjustElements });
    adjustElements(gridInfo);
  }, [adjustElements, gridInfo, dimensions]);

  return {
    gridElements,
  };
};
