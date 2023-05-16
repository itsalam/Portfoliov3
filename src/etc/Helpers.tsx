import { SVGProps, useEffect, useState } from 'react';

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
      <div className="h-32 w-32 animate-spin  rounded-full border-8 border-solid border-gray-500/50 border-t-transparent"></div>
    </div>
  );
}
