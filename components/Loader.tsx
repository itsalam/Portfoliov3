"use client";

import { motion, useSpring } from "framer-motion";
import { FC } from "react";

interface LoaderProps {}

const Loader: FC<LoaderProps> = () => {
  const progress = useSpring(0, { duration: 1.4 });
  return (
    <motion.div
      className="font-favorit"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <motion.div
        style={{
          fontSize: "48px",
          fontWeight: "bold",
          x: progress,
        }}
      >
        {progress.get()}&amp;
      </motion.div>
    </motion.div>
  );
};

export default Loader;
