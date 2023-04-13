import useStore from '@src/store';
import { debounce } from 'lodash';
import { useCallback, useEffect, useRef } from 'react';

const { setProgress, pages, setActivePage } = useStore.getState();

export const getScrollProgress = (containerElem: Element): number => {
  const rect = containerElem.getBoundingClientRect();
  return containerElem
    ? -rect.top / (containerElem.clientHeight - window.innerHeight)
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
      window.addEventListener('scroll', onScroll);
    }

    callbacks.forEach((callback) => callback(node));
  }, []);

  return { containerRef, containerCallback };
};

const debounceSetActivePage = debounce(
  (entries: IntersectionObserverEntry[]) => {
    const { activePage } = useStore.getState();
    entries = entries.filter((e) => e.isIntersecting);
    if (entries) {
      const focusedEntry = entries.reduce((prev, curr) =>
        prev.intersectionRatio > curr.intersectionRatio ? prev : curr
      );
      if (focusedEntry) {
        const index = pages.findIndex(
          (page) => page.toLocaleLowerCase() === focusedEntry.target.id
        );
        if (index !== activePage) {
          setActivePage(index);
        }
      }
    }
  },
  200,
  { maxWait: 500 }
);

const observer = new IntersectionObserver(
  (entries) => {
    debounceSetActivePage(entries);
  },
  { threshold: 0.3 }
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

export const isWide = () => {
  console.log(window.innerWidth);
  return window.innerWidth >= 768;
};
