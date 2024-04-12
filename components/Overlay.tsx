"use client";

import { GridContext } from "@/lib/state";
import { Separator, Text } from "@radix-ui/themes";
import { throttle } from "lodash";
import { ArrowBigRight } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";
import { useStore } from "zustand";
import DigitSpinner from "./motion/DigitSpinner";
import Clock from "./util/Clock";

const Overlay: React.FC = () => {
  const currentDate = new Date().toLocaleDateString("en-GB");
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
        setFPS(frameCount);
      },
      5000,
      { leading: true }
    );

    let lastFrameTime = Date.now();
    let frameCount = 0;
    let currAnimationFrame = 0;
    const [fps, setFPS] = useState(0);
    function animate() {
      const now = Date.now();
      frameCount++;

      if (now - lastFrameTime >= 1000) {
        throttleFPS(frameCount);
        frameCount = 0;
        lastFrameTime = now;
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
        <Text className="relative flex" size={"1"}>
          fps
        </Text>
      </div>
    );
  };

  return (
    <div className="font-overlay md:flex-row absolute bottom-g-2/8 right-g-2/8 z-50 flex flex-col gap-x-1 gap-y-0.5">
      <div className="flex flex-col gap-0.5">
        <Text className="flex w-full justify-center text-right" size={"2"}>
          {currentDate}
        </Text>
        <Separator size={"4"} />
        <Text
          className="flex w-full justify-center gap-1 text-right"
          size={"1"}
        >
          {screenString}
          <ArrowBigRight className="my-auto h-full" size={12} />
          <FPSSpinner />
        </Text>
      </div>
      <Separator size={"4"} />
      <Clock />
    </div>
  );
};

export default Overlay;
