import { createStyles } from '@mantine/core';
import { SVGProps, useEffect, useState } from 'react';

export const getCX = createStyles(() => ({}));

export const valToHex = (val: string): string => {
  let radix = 10;
  let res = '';
  if (val.startsWith('#')) {
    res += '0x';
    radix = 16;
    val = val.substring(1);
  }

  const hexadecimal = parseInt(val, radix).toString(16);
  console.log(hexadecimal);
  return res + (hexadecimal.length === 1 ? `0${hexadecimal}` : hexadecimal);
};

export const RGBtoHex = (vals: string[]) => {
  let hex = vals
    .map((val) => (val.includes('#') ? val : valToHex(val)))
    .join('');
  if (!hex.includes('#')) {
    hex = `#${hex}`;
  }
  return hex;
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

export const isWideListener = (breakpoint?: number) => {
  const [isWide, setIsWide] = useState<boolean>(
    window.innerWidth >= (breakpoint ?? 1024)
  );

  useEffect(() => {
    const updateIsWide = () => {
      setIsWide(window.innerWidth >= (breakpoint ?? 1024));
    };

    updateIsWide();
    window.addEventListener('resize', updateIsWide);
    return () => document.removeEventListener('resize', updateIsWide);
  }, []);

  return isWide;
};

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

export function DefaultLoader() {
  return (
    <div className="absolute bottom-1/2 right-1/2  translate-x-1/2 translate-y-1/2">
      <div className="h-32 w-32 animate-spin  rounded-full border-8 border-solid border-gray-500/50 border-t-transparent" />
    </div>
  );
}

export const handleScroll: React.WheelEventHandler<HTMLDivElement> = (e) => {
  const element = e.currentTarget;
  console.log(element.scrollHeight, element.clientHeight, element.scrollTop);
  if (
    element.scrollHeight === element.clientHeight ||
    (e.deltaY < 0 &&
      element.scrollTop === 0 &&
      element.scrollHeight > element.clientHeight) ||
    (e.deltaY > 0 &&
      element.scrollHeight - element.clientHeight - element.scrollTop < 10 &&
      element.scrollHeight > element.clientHeight)
  ) {
    return;
  }
  e.stopPropagation();
};
