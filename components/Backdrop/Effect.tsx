import React, { MouseEventHandler, useEffect } from "react";
import { motion, useAnimate, useMotionValue } from "framer-motion";

const Effect = () => {
  const [scope, animate] = useAnimate();
  const x = useMotionValue(200);
  const y = useMotionValue(200);
  const handleMouse = (ev: MouseEvent) => {
    x.set(ev.clientX);
    y.set(ev.clientY);
  };

  useEffect(() => {
    const animation = async () => {
      animate(
        ".blob",
        {
          x: `${Math.random() * 100}%`,
          y: `${Math.random() * 100}%`,
        },
        { duration: 2 }
      );
    };
    const interval = setInterval(() => animation(), 3000);
    window.addEventListener("mousemove", handleMouse);
    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <motion.div className="absolute w-screen h-screen">
      <motion.div
        ref={scope}
        className="absolute backdrop w-screen h-screen bg-[#edfcf71f] overflow-hidden "
      >
        <motion.div className="blob absolute w-4/5 h-2/3 top-0 left-0 bg-gradient-radial from-[#EC6142] via-transparent to-transparent" />
        <motion.div className="blob absolute w-2/3 h-1/2 top-0 left-0 bg-gradient-radial from-[#9A5CD0] via-transparent to-transparent" />
        <motion.div
          className="mouse-effect rounded-full w-g-x-3 aspect-square absolute top-0 left-0 blur-md"
          style={{ x, y }}
        />
      </motion.div>
    </motion.div>
  );
};

export default Effect;
