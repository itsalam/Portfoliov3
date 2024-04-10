"use client";

import { cn } from "@/lib/utils";
import { Text } from "@radix-ui/themes";
import React, { useEffect, useState } from "react";

const Clock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState("");
  const [isAm, setIsAm] = useState(new Date().getHours() >= 12);

  useEffect(() => {
    const interval = setInterval(() => {
      const date = new Date();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      // const seconds = date.getSeconds();
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes.toString().padStart(2, "0");
      // const formattedSeconds = seconds.toString().padStart(2, "0");
      setCurrentTime(`${formattedHours}:${formattedMinutes}`);
      setIsAm(hours >= 12);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Text className="flex-start flex gap-1 text-right" size={"7"}>
      {currentTime}
      <div className="flex flex-col">
        <Text
          className={cn("block w-full text-right leading-4", {
            "text-[--gray-a6]": isAm,
          })}
          size={"2"}
        >
          AM
        </Text>
        <Text
          className={cn("block w-full text-right leading-4", {
            "text-[--gray-a6]": !isAm,
          })}
          size={"2"}
        >
          PM
        </Text>
      </div>
    </Text>
  );
};

export default Clock;
