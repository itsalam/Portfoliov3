import useStore from "@src/store";
import { debounce } from "lodash";
import { useCallback, useEffect, useRef } from "react";


const { setProgress, pages, setActivePage } = useStore.getState();

export const getScrollProgress = (containerElem: Element): number => {
  const rect = containerElem.getBoundingClientRect();
  return containerElem
    ? -(rect.top) / (containerElem.clientHeight- window.innerHeight)
    : -1;
};

export const updateScrollProgress = (
  ref?: React.MutableRefObject<Element | undefined>,
  ...callbacks: ((node: any) => void)[]
) => {
  const containerRef = ref || useRef<Element>();
  const containerCallback = useCallback((node) => {
    const onScroll = debounce((e) => {
      const scrollProgress: number = getScrollProgress(containerRef.current!);
      if (scrollProgress < 1 && scrollProgress > 0) {
        setProgress(scrollProgress);
      }
    });

    containerRef.current = node;
    if (containerRef.current) {
      window.addEventListener("scroll", onScroll);
    }

    callbacks.forEach((callback) => callback(node));
  }, []);

  return { containerRef, containerCallback };
};

let observer = new IntersectionObserver(
  (entries, observer) => {
    const {activePage} = useStore.getState();
    entries.forEach((entry) => {

    //   console.log(entry);
      // if (entry.intersectionRatio === .40) {
      //   setProgress(0);
      // }
    });
    const focusedEntry = entries.reduce((prev, curr, i, arr) => {
        return prev.intersectionRatio > curr.intersectionRatio? prev: curr;
    })
    const index = pages.findIndex( page => page.toLocaleLowerCase() === focusedEntry.target.id);
    if (index !== activePage){
      setActivePage(index)
    }
  }, {threshold: .3}
);

export const pageRef = (
  ref?: React.MutableRefObject<Element | undefined>,
  ...callbacks: ((node: any) => void)[]
) => {
  const containerRef = ref || useRef<Element>();

  const containerCallback = useCallback((node) => {
    containerRef.current = node;
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    callbacks.forEach((callback) => callback(node));
  }, []);

  return { containerRef, containerCallback };
};
