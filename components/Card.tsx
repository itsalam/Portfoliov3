"use client";

import { cn } from "@/lib/utils";
import { Separator } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { motion, useDragControls } from "framer-motion";
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
  return (
    <motion.div {...rest} ref={ref} className={cn("card", className)}>
      {children}
    </motion.div>
  );
});

Card.displayName = "Card";

export const TitleCard = forwardRef<
  ElementRef<typeof motion.div>,
  ComponentPropsWithoutRef<typeof motion.div> & { containerClassName?: string }
>((props, ref) => {
  const { containerClassName, className, children, title, ...rest } = props;
  const dragControls = useDragControls();

  function startDrag(event: PointerEvent) {
    dragControls.start(event);
  }

  return (
    <motion.div
      drag
      dragListener={false}
      dragControls={dragControls}
      className={cn(
        "flex flex-col card overflow-hidden absolute",
        containerClassName
      )}
      ref={ref}
      {...rest}
    >
      <div
        onPointerDown={startDrag}
        className="flex flex-col px-3 h-g-y-0.25 relative bg-[--gray-a5] justify-center bg-blur-xl"
      >
        <p className="text-xs">{title?.toUpperCase()}</p>
        <div className="absolute bottom-0 w-full">
          <Separator size="4" />
        </div>
      </div>
      <motion.div className={className} {...rest}>
        {children}
      </motion.div>
    </motion.div>
  );
});

TitleCard.displayName = "TitleCard";

export default Card;
