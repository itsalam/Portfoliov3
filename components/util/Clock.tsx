"use client";

import { cn } from "@/lib/utils";
import { Text } from "@radix-ui/themes";
import React, { useEffect, useState } from "react";
import DigitSpinner from "../motion/DigitSpinner";

const Clock: React.FC = () => {
  const [isAm, setIsAm] = useState(new Date().getHours() >= 12);
  const [hours, setHours] = useState(new Date().getHours() % 12 || 12);
  const [minutes, setMinutes] = useState(new Date().getMinutes());
  // const [seconds, setSeconds] = useState(new Date().getSeconds());

  useEffect(() => {
    const interval = setInterval(() => {
      const date = new Date();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      // const seconds = date.getSeconds();
      const formattedHours = hours % 12 || 12;

      // const formattedSeconds = seconds.toString().padStart(2, "0");
      // setCurrentTime(`${formattedHours}:${formattedMinutes}`);
      setHours(formattedHours);
      setMinutes(minutes);
      // setSeconds(seconds);
      setIsAm(hours >= 12);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Text
      className={
        "flex-start relative flex items-center gap-0 text-right font-sans"
      }
      size={"9"}
    >
      <DigitSpinner
        digit={~~(hours / 10)}
        textProps={{ size: "9", trim: "end" }}
      />
      <DigitSpinner
        digit={~~(hours % 10)}
        textProps={{ size: "9", trim: "end" }}
      />
      <Text
        className="relative bottom-0"
        size={"3"}
      >
        :
      </Text>
      <DigitSpinner
        digit={~~(minutes / 10)}
        textProps={{ size: "9", trim: "end" }}
      />
      <DigitSpinner
        digit={~~(minutes % 10)}
        textProps={{ size: "9", trim: "end" }}
      />
      <div className="flex flex-col items-start">
        <Text
          className={cn(
            "block h-4 w-full text-right leading-4",
            {
              "text-[--gray-a6]": isAm,
            }
          )}
          size={"3"}
        >
          AM
        </Text>
        <Text
          className={cn(
            "block h-4 w-full text-right leading-4",
            {
              "text-[--gray-a6]": !isAm,
            }
          )}
          size={"3"}
        >
          PM
        </Text>
      </div>
    </Text>
  );
};

export default Clock;
