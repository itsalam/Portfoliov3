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
  const x = useSpring(baseX, { damping: 10 });
  const y = useSpring(baseX, { damping: 10 });

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
    const followMouse = (e: MouseEvent) => {
      baseX.set(e.clientX);
      baseY.set(e.clientY);
    };
    window.addEventListener("mousemove", followMouse);
    return () => {
      window.removeEventListener("mousemove", followMouse);
    };
  });
  return (
    <motion.div
      style={{ x: baseX, y: baseY }}
      id="cursor"
      className="mouse-effect pointer-events-none absolute left-0 top-0 z-[50] aspect-square w-10 cursor-none rounded-full backdrop-grayscale backdrop-invert"
    />
  );
};

export default Effect;
