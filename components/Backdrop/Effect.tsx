import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
} from "framer-motion";
import { useEffect, useRef } from "react";
import { moveCursorEffect } from "../Grid/util";

const Effect = () => {
  const baseX = useMotionValue(-100);
  const baseY = useMotionValue(-100);
  const x = useSpring(baseX, { stiffness: 200, damping: 30 });
  const y = useSpring(baseY, { stiffness: 200, damping: 30 });

  const getCanvas = () => {
    const canvas = document.getElementById("mask");
    if (canvas) {
      canvas.setAttribute("data-circle-radius", `${40}`);
    }
    return canvas;
  };
  const canvas = useRef(getCanvas());

  const updateAttribute = (dataAttr: string) => (latest: string) => {
    canvas.current = canvas.current || getCanvas();
    if (canvas.current !== null) {
      canvas.current.setAttribute(dataAttr, `${latest}`);
      moveCursorEffect(canvas.current);
    }
  };

  useMotionValueEvent(x, "change", updateAttribute("data-circle-x"));
  useMotionValueEvent(y, "change", updateAttribute("data-circle-y"));

  useEffect(() => {
    const followMouse = (e: { clientX: number; clientY: number }) => {
      baseX.set(e.clientX);
      baseY.set(e.clientY);
    };
    const followTouch = (e: TouchEvent) => {
      followMouse(e.touches[0]);
    };
    window.addEventListener("mousemove", followMouse);
    window.addEventListener("touchmove", followTouch);
    return () => {
      window.removeEventListener("mousemove", followMouse);
      window.removeEventListener("touchmove", followTouch);
    };
  });
  return (
    <motion.div
      initial={{
        maskImage: "linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1))",
      }}
      style={{
        x,
        y,
      }}
      id="cursor"
      className="mouse-effect pointer-events-none absolute left-0 top-0 z-[50] aspect-square w-10 cursor-none rounded-full backdrop-grayscale backdrop-invert"
    />
  );
};

export default Effect;
