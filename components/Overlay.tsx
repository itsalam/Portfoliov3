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
    const handleWindowSizeChange = () => {
      const { width, height } = dimensions;
      setScreenString(`${width} x ${height}`);
    };
    handleWindowSizeChange();
    window.addEventListener("resize", handleWindowSizeChange);
    return () => window.removeEventListener("resize", handleWindowSizeChange);
  }, [dimensions]);

  return (
    <nav className="w-screen h-screen fixed left-0 z-0">
      <div className="absolute  top-g-y-2/8  right-g-x-2/8 font-favorit">
        <Text className="w-full text-right block" size={{ xl: "5", md: "2" }}>
          {currentDate}
        </Text>
        <Text className="w-full text-right block" size={{ xl: "5", md: "2" }}>
          <Clock />
        </Text>
      </div>
      <Text
        className="absolute text-right right-g-x-2/8 bottom-g-y-2/8 font-favorit"
        size={{ xl: "5", md: "2" }}
      >
        {screenString}
      </Text>
      {/* <div className="container backdrop w-screen h-screen overflow-hidden pointer-events-none -z-50"></div> */}
    </nav>
  );
};

export default Overlay;
