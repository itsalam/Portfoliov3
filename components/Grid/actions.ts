import { GridInfo, GridStore } from "@/lib/providers/clientState";
import { isWebGLSupported } from "@/lib/providers/clientUtils";
import { useCallback, useEffect, useRef, useState } from "react";
import { StoreApi } from "zustand";
import { CARD_TYPES } from "../Cards/types";
import { GridElements } from "./consts";
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
      console.log(ids);
      let newGridElements = new Map(gridElements);
      if (activeCard && ids.includes(activeCard)) {
        return;
      } else {
        const cards = ids.map((id) => {
          const gridElem =
            newGridElements.get(id) ?? getDefaultGridElement(id, gridInfo);
          newGridElements.set(id, gridElem);
          return gridElem;
        });
        const toggleableCard = cards.find((gridElem) => gridElem.canExpand);
        if (toggleableCard) {
          toggleCard(toggleableCard.id);
        } else {
          toggleCard(null);
          const reorderedMap = new Map();
          cards.forEach((card) => {
            reorderedMap.set(card.id, card);
          });
          console.log({ cards });
          for (const [key, value] of newGridElements) {
            if (!reorderedMap.has(key)) {
              reorderedMap.set(key, value);
            }
          }
          console.log({ newGridElements, reorderedMap });
          newGridElements = reorderedMap;
        }
        setGridElements(newGridElements);
        adjustElements(gridInfo);
      }
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
    adjustElements(gridInfo);
  }, [adjustElements, gridInfo, dimensions]);

  return {
    gridElements,
    scrollAreaRef,
  };
};
