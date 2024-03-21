"use client";

import { motion } from "framer-motion";

import { GridInfo } from "@/lib/state";
import { FC } from "react";
import GridMask from "./GridMask";

const GridBackdrop: FC<{ gridInfo: GridInfo }> = () => {
  return (
    <motion.div
      whileInView={"view"}
      animate="view"
      initial="initial"
      viewport={{ once: true }}
      className="-z-50 absolute h-full w-full left-0"
    >
      <GridMask />
    </motion.div>
  );
};

export default GridBackdrop;
