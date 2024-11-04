/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { GridContext } from "@/lib/providers/clientState";
import { p3ToHex } from "@/lib/providers/clientUtils";
import { cn } from "@/lib/utils";
import { MotionValue, m, useSpring, useTransform } from "framer-motion";
import { useTheme } from "next-themes";
import { ComponentProps, ReactNode, useContext, useMemo, useRef } from "react";
import { useStore } from "zustand";
import { BackButton } from "../Buttons/BackButton";

export const TracingBeam: React.FC<
  ComponentProps<typeof m.div> & {
    children: ReactNode;
    scrollYProgress: MotionValue<number>;
    height: number;
    offset: number;
    disableScroll?: boolean;
  }
> = (props) => {
  const {
    disableScroll,
    className,
    children,
    scrollYProgress,
    height,
    offset,
    ...otherProps
  } = props;
  const store = useContext(GridContext)!;
  const { activeCard, toggleCard, gridInfo } = useStore(store);
  const { isMobile } = gridInfo;
  const { resolvedTheme } = useTheme();
  const contentRef = useRef<HTMLDivElement>(null);

  const y1 = useSpring(useTransform(scrollYProgress, [0, 0.8], [0, height]), {
    stiffness: 300,
    damping: 90,
  });
  const y2 = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, height - 200]),
    {
      stiffness: 300,
      damping: 90,
    }
  );

  const baseColor = useMemo(() => p3ToHex("--gray-5"), [resolvedTheme]);
  const accentColor = useMemo(() => p3ToHex("--accent-8"), [resolvedTheme]);
  const accentColor2 = useMemo(() => p3ToHex("--accent-7"), [resolvedTheme]);

  const backgroundColor = useTransform(
    y2,
    [0, (height - 200) * 0.05],
    [accentColor, baseColor]
  );

  const borderColor = useTransform(
    y2,
    [0, (height - 200) * 0.05],
    [accentColor2, baseColor]
  );

  return (
    <m.div
      className={cn(
        "relative mb-40 h-full w-full",
        className
      )}
      {...otherProps}
    >
      {!isMobile ||
        (disableScroll && (
          <>
            {activeCard ? (
              <BackButton
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="translate-y-1/2 absolute top-4 right-4 z-50"
                onClick={() => toggleCard(null)}
              />
            ) : (
              <m.div
                className={
                  "sm:right-g-2/8 sm:top-g-2/8 sm:z-10 absolute top-2 right-2"
                }
              >
                <m.div
                  initial={{ opacity: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: 0.5,
                  }}
                  animate={{
                    opacity: 1,
                    boxShadow:
                      scrollYProgress.get() > 0
                        ? "rgba(0, 0, 0, 0.0) 0px 0px 0px"
                        : "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                    borderColor: "#ECEEED",
                  }}
                  className={cn(
                    "border shadow-sm",
                    "ml-[27px] flex h-4 w-4 items-center justify-center", // margin, sizing, layout
                    "rounded-full" // border
                  )}
                >
                  <m.div
                    transition={{
                      duration: 0.2,
                      delay: 0.5,
                    }}
                    style={{
                      backgroundColor,
                      borderColor,
                    }}
                    className={cn(
                      "border h-2 w-2 rounded-full"
                    )}
                  />
                </m.div>
                <m.svg
                  viewBox={`0 0 20 ${height - offset}`}
                  width="20"
                  height={height - offset} // Set the SVG height
                  className="ml-4 block"
                  aria-hidden="true"
                >
                  <m.path
                    d={`M 1 0V -36 l 18 24 V ${height * 0.8 - offset} l -18 24V ${height - offset}`}
                    fill="none"
                    stroke={baseColor}
                    strokeOpacity="0.16"
                    transition={{
                      duration: 10,
                    }}
                  />
                  <m.path
                    d={`M 1 0V -36 l 18 24 V ${height * 0.8 - offset} l -18 24V ${height - offset}`}
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="1.25"
                    className="motion-reduce:hidden"
                    transition={{
                      duration: 10,
                    }}
                  />
                  <defs>
                    <m.linearGradient
                      id="gradient"
                      gradientUnits="userSpaceOnUse"
                      x1="0"
                      x2="0"
                      y1={y1} // set y1 for gradient
                      y2={y2} // set y2 for gradient
                    >
                      <stop stopColor="var(--accent-8)" stopOpacity="0"></stop>
                      <stop stopColor="var(--accent-9)"></stop>
                      <stop offset="0.325" stopColor="var(--iris-9)"></stop>
                      <stop
                        offset="1"
                        stopColor="var(--accent-8)"
                        stopOpacity="0"
                      ></stop>
                    </m.linearGradient>
                  </defs>
                </m.svg>
              </m.div>
            )}
          </>
        ))}
      <m.div
        className="relative z-0 h-full w-full"
        ref={contentRef}
      >
        {children}
      </m.div>
    </m.div>
  );
};
