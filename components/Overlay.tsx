"use client";

import { useWebGLSupport } from "@/lib/hooks";
import { GridContext } from "@/lib/providers/clientState";
import { cn } from "@/lib/utils";
import { Text } from "@radix-ui/themes";
import { throttle } from "lodash";
import { CornerDownRight, Info, MonitorDot } from "lucide-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import DigitSpinner from "./motion/DigitSpinner";

const UPDATE_INTERVAL = 5;

const FPSSpinner: React.FC = () => {
  const throttleFPS = throttle(
    (frameCount) => {
      setFPS(frameCount / UPDATE_INTERVAL);
    },
    1000,
    { leading: true }
  );

  const lastFrameTime = useRef(0);
  const frameCount = useRef(0);
  let currAnimationFrame = 0;
  const [fps, setFPS] = useState(0);

  function animate() {
    const now = performance.now();

    frameCount.current += 1;
    if (now - lastFrameTime.current >= 1000 * (fps ? UPDATE_INTERVAL : 1)) {
      throttleFPS(frameCount.current);
      frameCount.current = 0;
      lastFrameTime.current = now;
    }

    currAnimationFrame = requestAnimationFrame(animate);
  }

  useEffect(() => {
    animate();
    return () => {
      cancelAnimationFrame(currAnimationFrame);
    };
  });

  return (
    <div className="relative flex">
      <DigitSpinner digit={~~(fps / 10)} textProps={{ size: "1" }} />
      <DigitSpinner digit={~~(fps % 10)} textProps={{ size: "1" }} />
      <Text
        className="relative flex pl-0.5"
        size={"1"}
      >
        FPS
      </Text>
    </div>
  );
};

const OverlayInfo: React.FC = () => {
  const webgl = useWebGLSupport();
  const [screenString, setScreenString] = useState("");
  const store = useContext(GridContext);
  const dimensions = useStore(store!).dimensions;

  useEffect(() => {
    const { width, containerHeight } = dimensions;
    setScreenString(`${width.toFixed()}x${containerHeight.toFixed()}`);
  }, [dimensions]);

  return (
    <div
      className={cn(
        "glass md:flex",
        "absolute right-g-1/8 bottom-g-1/8", // basicStyles, positioning
        "z-50 hidden items-center justify-center gap-2", // layoutControl, sizing, layout
        "rounded-lg dark:bg-[--black-a10] bg-[--white-a10]", // border, background
        "p-2 text-[--accent-12]" // padding, textStyles
      )}
    >
      {!webgl && (
        <div
          className={cn(
            "flex", // sizing
            "items-center gap-1 rounded-lg bg-[--gray-a2]", // layout, border, background
            "p-2 text-sm" // padding, textStyles
          )}
        >
          <Info /> For intended UX, enable hardware acceleration.
        </div>
      )}
      <div className="flex flex-col items-center justify-center gap-0.5">
        <Text
          className="flex w-full gap-1 text-right"
          size={"1"}
        >
          {screenString}
        </Text>
        <Text
          className={
            "flex w-full items-center justify-center gap-0.5 text-right"
          }
          size={"1"}
        >
          <CornerDownRight
            className="h-2"
            size={8}
          />
          <MonitorDot size={"12"} />
          <FPSSpinner />
        </Text>
      </div>
    </div>
  );
};

export default OverlayInfo;
