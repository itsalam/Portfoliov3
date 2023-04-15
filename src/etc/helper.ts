import useStore from '@src/store';
import { debounce } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';

const { setProgress, pages, setActivePage } = useStore.getState();

export const getScrollProgress = (containerElem?: Element): number => {
  return containerElem
    ? -containerElem.getBoundingClientRect().top /
        (containerElem.clientHeight - window.innerHeight)
    : -1;
};

export const updateScrollProgress = (
  ref?: React.MutableRefObject<Element | undefined>,
  ...callbacks: ((node: Element) => void)[]
) => {
  const containerRef = ref || useRef<Element>();
  const containerCallback = useCallback((node: Element) => {
    const onScroll = debounce(() => {
      const scrollProgress: number = getScrollProgress(containerRef.current);
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
    if (entries.length) {
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
  { threshold: 0.25 }
);

export const pageRef = (
  ref?: React.MutableRefObject<Element | undefined>,
  ...callbacks: ((node: Element) => void)[]
) => {
  const containerRef = ref || useRef<Element>();

  const containerCallback = useCallback((node: Element) => {
    containerRef.current = node;
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    callbacks.forEach((callback) => callback(node));
  }, []);

  return { containerRef, containerCallback };
};

export const isMobileListener = () => {
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  useEffect(() => {
    const updateIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    updateIsMobile();
    window.addEventListener('resize', updateIsMobile);
    return () => window.removeEventListener('resize', updateIsMobile);
  }, []);

  return isMobile;
};

export const isWideListener = () => {
  const [isWide, setIsWide] = useState<boolean>(window.innerWidth >= 1028);

  useEffect(() => {
    const updateIsWide = () => {
      setIsWide(window.innerWidth >= 1280);
    };

    updateIsWide();
    window.addEventListener('resize', updateIsWide);
    return () => window.removeEventListener('resize', updateIsWide);
  }, []);

  return isWide;
};

const valToHex = (color: string): string => {
  const hexadecimal = parseInt(color).toString(16);
  return hexadecimal.length == 1 ? '0' + hexadecimal : hexadecimal;
};

export const RGBtoHex = (vals: string[]) => {
  let hex = vals
    .map((val) => (val.includes('#') ? val : valToHex(val)))
    .join('');
  if (!hex.includes('#')) {
    hex = '#' + hex;
  }
  return hex;
};
