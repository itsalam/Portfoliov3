"use client";

import React, { useEffect, useState } from "react";

const Clock: React.FC = () => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      const date = new Date();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes.toString().padStart(2, "0");
      const formattedSeconds = seconds.toString().padStart(2, "0");
      setCurrentTime(
        `${formattedHours}:${formattedMinutes} ${ampm}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return currentTime;
};

export default Clock;
