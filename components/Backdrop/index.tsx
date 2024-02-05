"use client";

import { motion } from "framer-motion";
import Effect from "./Effect";
import Grid from "./Grid";

const Backdrop = () => {
  return (
    <motion.div
      whileInView={"view"}
      animate="view"
      initial="initial"
      viewport={{ once: true }}
      className="-z-50 absolute h-screen w-screen "
    >
      <Effect />
      <Grid />
    </motion.div>
  );
};

export default Backdrop;
