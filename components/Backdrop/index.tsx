"use client";

import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { debounce } from "lodash";
import Grid, { Dimensions } from "./Grid";
import Effect from "./Effect";

const Backdrop = () => {
  return (
    <motion.div
      whileInView={"view"}
      animate="view"
      initial="initial"
      viewport={{ once: true }}
    >
      <Effect />
      <Grid />
    </motion.div>
  );
};

export default Backdrop;
