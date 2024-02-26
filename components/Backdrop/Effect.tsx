import { motion, useMotionValue } from "framer-motion";
import { useEffect } from "react";

const Effect = () => {
  const x = useMotionValue(200);
  const y = useMotionValue(200);

  useEffect(() => {
    const handleMouse = (ev: MouseEvent) => {
      x.set(ev.clientX);
      y.set(ev.clientY);
    };

    // window.addEventListener("mousemove", handleMouse, { passive: true });
    // return () => {
    //   clearInterval(interval);
    //   window.removeEventListener("mousemove", handleMouse);
    // };
  }, [x, y]);

  return (
    <motion.div className="absolute w-screen h-screen top-0 opacity-0">
      <motion.div className="absolute backdrop w-screen h-screen overflow-hidden bg-[--jade-2]">
        <motion.div
          className="mouse-effect rounded-full w-g-x-3 aspect-square absolute top-0 left-0 "
          style={{ x, y }}
        />
      </motion.div>
    </motion.div>
  );
};

export default Effect;
