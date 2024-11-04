import { GridContext, GridInfo, GridStore } from "@/lib/clientState";
import { useAnimate } from "framer-motion";
import { debounce } from "lodash";
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { StoreApi, useStore } from "zustand";
import { CARD_TYPES } from "../Cards/types";
import { GridElement, GridElements, SCROLL_TO_CARD_DELAY } from "./consts";
import { binpackElements, getDefaultGridElement } from "./util";

export const useActions = (
  context: StoreApi<GridStore>,
  gridElements: GridElements,
  setGridElements: Dispatch<SetStateAction<GridElements>>,
  gridInfoRef: MutableRefObject<GridInfo>
) => {
  const { addListener, toggleCard } = context.getInitialState();
  const store = useContext(GridContext);
  const activeCard = useStore(store!).activeCard;
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [gridRef] = useAnimate();

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
                setTimeout(
                  () => {
                    if (gridElem.canExpand) {
                      toggleCard(gridElem.id);
                    }
                  },
                  activeCard ? 100 : 50
                );
              } else {
                gridElements.set(id, getDefaultGridElement(id, gridInfo));
                setGridElements(new Map(gridElements));
              }
            }),
        600
      );
    },
    [setGridElements, toggleCard, activeCard]
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
      binpackElements(gridElements, gridInfoRef.current);
    },
    [gridInfoRef, setGridElements]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const adjustElements = useCallback(
    debounce(
      (gridInfo) => {
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
      },
      200,
      { trailing: true }
    ),
    []
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

  return {
    adjustElements,
    gridRef,
    scrollToGridElement,
    scrollAreaRef,
  };
};
