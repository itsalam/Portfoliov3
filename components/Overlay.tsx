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
    <nav className="w-screen h-screen fixed">
      <div className="absolute  top-g-y-2/8  right-g-x-2/8 font-favorit w-g-x-1">
        <Text className="w-full text-right block" size={{ xl: "5", md: "2" }}>
          {currentDate}
        </Text>
        <Text className="w-full text-right block" size={{ xl: "5", md: "2" }}>
          <Clock />
        </Text>
      </div>
      {/* <div className="w-48 h-12 rounded-full absolute right-g-x-2/8 pb-g-x-1 bottom-0 -translate-y-g-y-2/8 -translate-x-g-x-1/8 rotate-90 flex items-center justify-center">
        <Text
          className="font-favorit whitespace-nowrap"
          size={{ xl: "5", md: "2" }}
        >
          Scroll Down
        </Text>
        <svg
          className="h-4 w-12"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="0" y1="12" x2="48" y2="12" />
          <line x1="36" y1="5" x2="48" y2="12" />
        </svg>
      </div> */}
      <Text
        className="absolute text-right right-g-x-2/8 w-g-x-1 bottom-g-y-2/8 font-favorit"
        size={{ xl: "5", md: "2" }}
      >
        {screenString}
      </Text>
    </nav>
  );
};

export default Overlay;
