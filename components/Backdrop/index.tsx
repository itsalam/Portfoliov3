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
      className="relative left-0 -z-50 h-full w-full"
    >
      <GridMask />
    </motion.div>
  );
};

export default GridBackdrop;
