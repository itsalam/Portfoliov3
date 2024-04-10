"use client";

import { GridContext } from "@/lib/state";
import { Separator, Text } from "@radix-ui/themes";
import React, { useContext, useEffect, useState } from "react";
import { useStore } from "zustand";
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

  return (
    <>
      <div className="font-overlay md:flex-row absolute bottom-g-2/8 right-g-2/8 z-50 flex flex-col gap-1">
        <div>
          <Text className="flex w-full justify-center text-right" size={"2"}>
            {currentDate}
          </Text>
          <Separator size={"4"} />
          <Text className="flex w-full justify-center text-right" size={"1"}>
            {screenString}
          </Text>
        </div>

        <Separator size={"4"} />
        <Clock />
      </div>

      {/* <Text
        className="font-overlay absolute  z-50 text-right"
        size={"9"}
      ></Text> */}
      {/* <div className="container backdrop w-screen h-screen overflow-hidden pointer-events-none -z-50"></div> */}
    </>
  );
};

export default Overlay;
