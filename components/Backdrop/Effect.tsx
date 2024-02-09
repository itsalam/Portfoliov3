import { motion, useAnimate, useMotionValue } from "framer-motion";
import { useEffect } from "react";

const Effect = () => {
  const [scope, animate] = useAnimate();
  const x = useMotionValue(200);
  const y = useMotionValue(200);

  useEffect(() => {
    const handleMouse = (ev: MouseEvent) => {
      x.set(ev.clientX);
      y.set(ev.clientY);
    };
    const animation = async () => {
      animate(
        ".blob",
        {
          x: `${Math.random() * 100}%`,
          y: `${Math.random() * 100}%`,
        },
        { duration: 10 }
      );
    };
    const interval = setInterval(() => animation(), 30000);
    window.addEventListener("mousemove", handleMouse);
    return () => {
      clearInterval(interval);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, [animate, x, y]);

  return (
    <motion.div className="absolute w-screen h-screen">
      <motion.div
        ref={scope}
        className="absolute backdrop w-screen h-screen overflow-hidden bg-[--cyan-5]"
      >
        <motion.div className="blob absolute w-4/5 h-2/3 top-0 left-0 bg-gradient-radial from-[--tomato-10] via-[--tomato-a10] to-transparent" />
        <motion.div className="blob absolute w-2/3 h-1/2 top-0 left-0 bg-gradient-radial from-[--purple-10] via-[--plum-a10] to-transparent" />
        <motion.div
          className="mouse-effect rounded-full w-g-x-3 aspect-square absolute top-0 left-0"
          style={{ x, y }}
        />
      </motion.div>
    </motion.div>
  );
};

export default Effect;
