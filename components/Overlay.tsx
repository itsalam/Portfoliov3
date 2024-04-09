"use client";

import { GridContext } from "@/lib/state";
import { Text } from "@radix-ui/themes";
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
    setScreenString(`${width.toFixed()} x ${containerHeight.toFixed()}`);
  }, [dimensions]);

  return (
    <>
      <div className="absolute  right-0 top-0 z-50 bg-gradient-to-tr from-transparent via-transparent to-background pr-g-3/8 pt-g-2/8 font-favorit">
        <Text className="block w-full text-right" size={{ xl: "5", md: "2" }}>
          {currentDate}
        </Text>
        <Text className="block w-full text-right" size={{ xl: "5", md: "2" }}>
          <Clock />
        </Text>
      </div>

      <Text
        className="absolute bottom-g-2/8 right-g-3/8 z-50 text-right font-favorit"
        size={{ xl: "5", md: "2" }}
      >
        {screenString}
      </Text>
      {/* <div className="container backdrop w-screen h-screen overflow-hidden pointer-events-none -z-50"></div> */}
    </>
  );
};

export default Overlay;
