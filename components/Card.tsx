"use client";

import { gridAtom } from "@/lib/state";
import { cn } from "@/lib/utils";
import { Separator, Text } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import {
  AnimationControls,
  motion,
  useAnimationControls,
  useDragControls,
} from "framer-motion";
import { useAtomValue } from "jotai";
import {
  ComponentPropsWithoutRef,
  ElementRef,
  PointerEvent,
  forwardRef,
  useRef,
} from "react";

const Card = forwardRef<
  ElementRef<typeof motion.div>,
  ComponentPropsWithoutRef<typeof motion.div>
>((props, ref) => {
  const { animate, className, children, ...rest } = props;
  const defaultAnimationControls = useAnimationControls();
  const animationControls = useRef(
    (animate as AnimationControls) || defaultAnimationControls
  );
  const dragControls = useDragControls();
  const { gridUnitWidth, gridUnitHeight } = useAtomValue(gridAtom);
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
        const matches = window
          .getComputedStyle(element)
          .getPropertyValue("transform")
          .match(/-?\d+\.?\d*/g);

        if (matches && matches.length >= 2) {
          // Get the last two matches and convert them to numbers
          const x = parseFloat(matches[matches.length - 2]);
          const y = parseFloat(matches[matches.length - 1]); // Output: 123.871, 133.571
          const fixedX =
            Math.round(x / (gridUnitWidth / 8)) * (gridUnitWidth / 8);
          const fixedY =
            Math.round(y / (gridUnitHeight / 8)) * (gridUnitHeight / 8);
          setTimeout(() => {
            animationControls.current.start({
              x: fixedX,
              y: fixedY,
            });
          }, 100);
        }
      }}
      className={cn("card overflow-hidden absolute", className)}
      animate={animationControls.current}
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
        className="flex flex-col px-3 h-g-y-2/8 relative bg-[--gray-a5] justify-center bg-blur-xl"
      >
        <Text size="3">{title?.toUpperCase()}</Text>
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
