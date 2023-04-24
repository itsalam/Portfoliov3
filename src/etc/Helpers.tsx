import { debounce } from 'lodash';
import { SVGProps, useCallback, useEffect, useRef, useState } from 'react';
import useStore from '@src/store';

const { setProgress, pages, setActivePage } = useStore.getState();

export const getScrollProgress = (containerElem?: Element): number => {
  return containerElem
    ? -containerElem.getBoundingClientRect().top /
        (containerElem.clientHeight - window.innerHeight)
    : -1;
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

export const updateScrollProgress = () => {
  const containerRef = useRef<Element>();
  const containerCallback = useCallback<React.RefCallback<Element>>(
    (node: Element) => {
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
    },
    []
  );

  return { containerRef, containerCallback };
};

export const pageRef = () => {
  const containerRef = useRef<Element>();

  const containerCallback = useCallback<React.RefCallback<Element>>(
    (node: Element) => {
      containerRef.current = node;
      if (containerRef.current) {
        observer.observe(containerRef.current);
      }
    },
    []
  );

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

export function useScreenSize() {
  const isClient = typeof window === 'object';

  function getSize() {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined
    };
  }

  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    if (!isClient) {
      return;
    }

    function handleResize() {
      setWindowSize(getSize());
    }
    console.log(getSize());
    setWindowSize(getSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

export const ArrowSVG = (props: SVGProps<SVGSVGElement>) => (
  <svg
    className="text-background h-5 w-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M14 5l7 7m0 0l-7 7m7-7H3"
    />
  </svg>
);
