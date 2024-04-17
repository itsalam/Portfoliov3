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
  const x = useSpring(baseX, { stiffness: 250, damping: 30 });
  const y = useSpring(baseY, { stiffness: 250, damping: 30 });

  const getCanvas = () => {
    const canvas = document.getElementById("mask");
    if (canvas) {
      canvas.setAttribute("data-circle-radius", `${64}`);
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
      style={{
        x,
        y,
      }}
      id="cursor"
      className="pointer-events-none absolute left-0 top-0 z-[50] aspect-square w-[1px] cursor-none rounded-full opacity-0"
    />
  );
};

export default Effect;
