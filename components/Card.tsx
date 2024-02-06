"use client";

import { cn } from "@/lib/utils";
import { Separator } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { motion, useAnimationControls, useDragControls } from "framer-motion";
import {
  ComponentPropsWithoutRef,
  ElementRef,
  PointerEvent,
  forwardRef,
} from "react";

const Card = forwardRef<
  ElementRef<typeof motion.div>,
  ComponentPropsWithoutRef<typeof motion.div>
>((props, ref) => {
  const { className, children, ...rest } = props;
  const animationControls = useAnimationControls();
  const dragControls = useDragControls();
  function startDrag(event: PointerEvent) {
    dragControls.start(event);
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragControls={dragControls}
      dragListener={false}
      onPointerDown={startDrag}
      onDragEnd={() => {
        if (!ref || typeof ref === "function" || !ref.current) return;
        const element = ref.current;
        const gridWidth = parseInt(
          document.documentElement.style.getPropertyValue("--grid-width"),
          10
        );
        const gridHeight = parseInt(
          document.documentElement.style.getPropertyValue("--grid-height"),
          10
        );
        const matches = window
          .getComputedStyle(element)
          .getPropertyValue("transform")
          .match(/-?\d+\.?\d*/g);

        if (matches && matches.length >= 2) {
          // Get the last two matches and convert them to numbers
          const x = parseFloat(matches[matches.length - 2]);
          const y = parseFloat(matches[matches.length - 1]); // Output: 123.871, 133.571
          const fixedX = Math.round(x / (gridWidth / 8)) * (gridWidth / 8);
          const fixedY = Math.round(y / (gridHeight / 8)) * (gridHeight / 8);
          setTimeout(() => {
            animationControls.start({
              x: fixedX,
              y: fixedY,
            });
          }, 100);
        }
      }}
      className={cn("card overflow-hidden absolute", className)}
      animate={animationControls}
      ref={ref}
      {...rest}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = "Card";

export const TitleCard = forwardRef<
  ElementRef<typeof Card>,
  ComponentPropsWithoutRef<typeof Card> & { containerClassName?: string }
>((props, ref) => {
  const { containerClassName, className, children, title, ...rest } = props;

  const dragControls = useDragControls();
  function startDrag(event: PointerEvent) {
    dragControls.start(event);
  }

  return (
    <Card
      className={cn("flex flex-col", containerClassName)}
      ref={ref}
      dragControls={dragControls}
      onPointerDown={undefined}
    >
      <div
        onPointerDown={startDrag}
        className="flex flex-col px-3 h-g-y-2/4 relative bg-[--gray-a5] justify-center bg-blur-xl"
      >
        <p className="text-xs">{title?.toUpperCase()}</p>
        <div className="absolute bottom-0 w-full">
          <Separator size="4" />
        </div>
      </div>
      <motion.div className={className} {...rest}>
        {children}
      </motion.div>
    </Card>
  );
});

TitleCard.displayName = "TitleCard";

export default Card;
