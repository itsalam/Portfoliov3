"use client";

import { motion } from "framer-motion";

import { FC, RefObject } from "react";
import GridMask from "./GridMask";

const GridBackdrop: FC<{ scrollAreaRef: RefObject<HTMLDivElement> }> = ({
  scrollAreaRef,
}) => {
  return (
    <motion.div
      whileInView={"view"}
      animate="view"
      initial="initial"
      viewport={{ once: true }}
      className="relative left-0 -z-50 h-full w-full"
    >
      <GridMask scrollAreaRef={scrollAreaRef} />
    </motion.div>
  );
};

export default GridBackdrop;
