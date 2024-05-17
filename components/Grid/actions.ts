import { GridInfo, GridStore } from "@/lib/state";
import { useAnimate } from "framer-motion";
import { debounce } from "lodash";
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { StoreApi } from "zustand";
import { CARD_TYPES } from "../Cards/types";
import { GridElement, GridElements, SCROLL_TO_CARD_DELAY } from "./consts";
import { binpackElements, getDefaultGridElement } from "./util";

export const useActions = (
  context: StoreApi<GridStore>,
  gridElements: GridElements,
  setGridElements: Dispatch<SetStateAction<GridElements>>,
  gridInfoRef: MutableRefObject<GridInfo>
) => {
  const { addListener } = context.getInitialState();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [gridRef] = useAnimate();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const scrollToGridElement = useCallback(
    debounce(
      (gridElement: GridElement, delay = 100) => {
        setTimeout(() => {
          scrollAreaRef.current?.scrollTo({
            top: Math.max(
              0,
              gridElement.coords[1] - gridInfoRef.current.gridUnitSize
            ),
            behavior: "smooth",
          });
        }, delay);
      },
      SCROLL_TO_CARD_DELAY,
      { trailing: true }
    ),
    []
  );

  const pushElements = useCallback(
    (gridInfo: GridInfo, gridElements: GridElements) => (ids: CARD_TYPES[]) => {
      ids.forEach((id) => {
        const gridElem = gridElements.get(id);
        if (gridElem) {
          // binpackElements(gridElements, gridInfo);
          scrollToGridElement(gridElem);
        } else {
          gridElements.set(id, getDefaultGridElement(id, gridInfo));
          setGridElements(new Map(gridElements));
        }
      });
    },
    [scrollToGridElement, setGridElements]
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
      // if (gridElements.size) {
      //   const lowestElem = [...gridElements.values()].reduce((acc, curr) =>
      //     acc.height + acc.coords[1] > curr.height + curr.coords[1] ? acc : curr);
      //   setLowestElem(lowestElem);
      // }
      binpackElements(gridElements, gridInfoRef.current);
    },
    [gridInfoRef, setGridElements]
  );

  //   const toggleCard = useCallback(
  //     (id: CARD_TYPES) => {
  //       controls.start("expand").then(() => console.log("!!"));
  //     },
  //     [animate, controls]
  //   );

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
