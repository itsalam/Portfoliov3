"use client";

import { MotionValue, motion } from "framer-motion";

import { FC } from "react";
import GridMask from "./GridMask";

const GridBackdrop: FC<{ scrollY: MotionValue<number> }> = ({ scrollY }) => {
  return (
    <motion.div
      whileInView={"view"}
      animate="view"
      initial="initial"
      viewport={{ once: true }}
      className="relative left-0 -z-50 h-full w-full"
    >
      <GridMask scrollY={scrollY} />
    </motion.div>
  );
};

export default GridBackdrop;
