"use client";

import { GridContext } from "@/lib/clientState";
import { useWebGLSupport } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { Text } from "@radix-ui/themes";
import { throttle } from "lodash";
import { CornerDownRight, Info, MonitorDot } from "lucide-react";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useStore } from "zustand";
import DigitSpinner from "./motion/DigitSpinner";

const OverlayInfo: React.FC = () => {
  const UPDATE_INTERVAL = 5;
  const webgl = useWebGLSupport();
  const [screenString, setScreenString] = useState("");
  const store = useContext(GridContext);
  const dimensions = useStore(store!).dimensions;

  useEffect(() => {
    const { width, containerHeight } = dimensions;
    setScreenString(`${width.toFixed()}x${containerHeight.toFixed()}`);
  }, [dimensions]);

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
      if ((now - lastFrameTime.current) >= 1000 * (fps ? UPDATE_INTERVAL : 1)) {
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
        <DigitSpinner digit={~~(fps / (10))} textProps={{ size: "1" }} />
        <DigitSpinner digit={~~((fps) % 10)} textProps={{ size: "1" }} />
        <Text
          className="relative flex pl-0.5"
          size={"1"}
        >
          FPS
        </Text>
      </div>
    );
  };

  return (
    <div
      className={cn(
        "glass gap-2 xs:flex absolute dark:bg-[--black-a10] bg-[--white-a10] rounded-lg p-2",
        "right-g-2/8 top-g-2/8 z-50 hidden", // positioning, layoutControl, sizing
        "items-center justify-center", // layout
        "text-[--accent-12]" // textStyles
      )}
    >
      {!webgl && <div className="bg-[--gray-a2] flex items-center gap-1 rounded-lg text-sm p-2">
        <Info /> For intended UX, enable hardware acceleration.
      </div>}
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
