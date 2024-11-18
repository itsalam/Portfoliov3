import { GridInfo, GridStore } from "@/lib/providers/clientState";
import { isWebGLSupported } from "@/lib/providers/clientUtils";
import { debounce } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { StoreApi } from "zustand";
import { CARD_TYPES } from "../Cards/types";
import { GridElement, GridElements } from "./consts";
import {
  binpackElements,
  getDefaultGridElement,
  initializeGridElements,
} from "./util";

const SCROLL_TO_CARD_DELAY = 100;

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
      return binpackElements(newGridElements, gridInfo);
    });
  }, []);

  const pushElements = useCallback(
    (gridInfo: GridInfo, gridElements: GridElements) => (ids: CARD_TYPES[]) => {
      // On basic view, immediately move to other card
      if (activeCard) {
        let newGridElements = new Map(gridElements);
        if (ids.includes(activeCard)) {
          return;
        } else {
          const cards = ids.map((id) => {
            const gridElem = getDefaultGridElement(id, gridInfo);
            newGridElements.set(id, gridElem);
            return gridElem;
          });
          const toggleableCard = cards.find((gridElem) => gridElem.canExpand);
          if (toggleableCard) {
            toggleCard(toggleableCard.id);
          } else {
            const reorderedMap = new Map();
            cards.forEach((card) => {
              reorderedMap.set(card.id, card);
            });
            for (const [key, value] of newGridElements) {
              if (!reorderedMap.has(key)) {
                reorderedMap.set(key, value);
              }
            }
            newGridElements = reorderedMap;
            setGridElements(newGridElements);
            adjustElements(gridInfo);
            toggleCard(null);
            return;
          }
        }
        setGridElements(newGridElements);
        return;
      }
      //if there is an active card, return to main view
      if (activeCard) {
        adjustElements(gridInfoRef.current);
        toggleCard(null);
        if (ids.includes(activeCard)) {
          return;
        }
      }

      //otherwise, find first element that can expand and toggle it.
      setTimeout(
        () =>
          ids.map((id, i) => {
            let gridElem = gridElements.get(id);
            if (gridElem) {
              if (gridElem.canExpand) {
                toggleCard(gridElem.id);
              }
            } else {
              gridElem = getDefaultGridElement(id, gridInfo);
              gridElements.set(id, gridElem);
              setGridElements(new Map(gridElements));
              adjustElements(gridInfoRef.current);
            }
            return gridElem;
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

  useEffect(() => {
    adjustElements(gridInfo);
  }, [adjustElements, gridInfo, dimensions]);

  return {
    gridElements,
    scrollAreaRef,
  };
};
