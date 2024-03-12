"use client";

import { motion } from "framer-motion";
import ParticlesCanvas from "../Canvases/ParticlesCanvas";

import Effect from "./Effect";
import Grid from "./GridEffect";

const Backdrop = () => {
  return (
    <motion.div
      whileInView={"view"}
      animate="view"
      initial="initial"
      viewport={{ once: true }}
      className="-z-50 absolute h-screen w-screen "
    >
      <ParticlesCanvas></ParticlesCanvas>
      <Effect />
      <Grid />
    </motion.div>
  );
};

export default Backdrop;
