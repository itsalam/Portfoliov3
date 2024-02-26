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
  useEffect,
  useRef,
  useState,
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
  const { gridUnitWidth, gridUnitHeight, oldVals } = useAtomValue(gridAtom);
  function startDrag(event: PointerEvent) {
    event.preventDefault();
    dragControls.start(event);
  }

  useEffect(() => {
    if (!ref || typeof ref === "function" || !ref.current) return;
    const element = ref.current;
    const matches = window
      .getComputedStyle(element)
      .getPropertyValue("transform")
      .match(/-?\d+\.?\d*/g);
    if (matches && matches.length >= 2) {
      // Get the last two matches and convert them to numbers
      const x = parseFloat(matches[matches.length - 2]);
      const y = parseFloat(matches[matches.length - 1]);
      const ratiodX = x * (gridUnitWidth / oldVals.gridUnitWidth);
      const ratiodY = y * (gridUnitHeight / oldVals.gridCellHeight);
      console.log(matches, ratiodX, ratiodY);
      animationControls.current.start({
        x: ratiodX,
        y: ratiodY,
      });
    }
  }, [gridUnitHeight, gridUnitWidth, oldVals, ref]);

  return (
    <motion.div
      {...rest}
      drag
      dragControls={dragControls}
      dragListener={false}
      onPointerDown={startDrag}
      onDragEnd={() => {
        if (!ref || typeof ref === "function" || !ref.current) return;

        setTimeout(() => {
          const element = ref.current;
          const matches = window
            .getComputedStyle(element)
            .getPropertyValue("transform")
            .match(/-?\d+\.?\d*/g);
          if (matches && matches.length >= 2) {
            // Get the last two matches and convert them to numbers
            const x = parseFloat(matches[matches.length - 2]);
            const y = parseFloat(matches[matches.length - 1]);
            const fixedX =
              Math.round(x / (gridUnitWidth / 8)) * (gridUnitWidth / 8);
            const fixedY =
              Math.round(y / (gridUnitHeight / 8)) * (gridUnitHeight / 8);
            animationControls.current.start({
              x: [null, fixedX],
              y: [null, fixedY],
              transition: { damping: 30, stiffness: 30 },
            });
          }
        }, 100);
      }}
      className={cn("card overflow-hidden absolute transition-all", className)}
      animate={animationControls.current}
      ref={ref}
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
  const [isDrag, setIsDrag] = useState(false);
  const dragControls = useDragControls();
  function startDrag(event: PointerEvent) {
    event.preventDefault();
    dragControls.start(event);
    setIsDrag(true);
  }

  function endDrag() {
    setIsDrag(false);
  }

  return (
    <Card
      className={cn(
        "flex flex-col group border-[1px] border-[--sage-a3] hover:border-[--sage-10] backdrop-blur-sm bg-[--gray-a1] ",
        containerClassName,
        {
          "border-[--sage-12]": isDrag,
        }
      )}
      ref={ref}
      dragControls={dragControls}
      onDragEnd={endDrag}
      {...rest}
    >
      <div
        onPointerDown={startDrag}
        draggable={false}
        className={cn(
          "flex opacity-20 group-hover:opacity-100 transition-opacity flex-col px-3 py-1 max-h-g-y-2/8 relative bg-[--gray-a3] justify-center",
          {
            "opacity-100": isDrag,
          }
        )}
      >
        <Text
          size="2"
          className="w-fit font-favorit"
          style={{ "--letter-spacing": "0.02em" }}
        >
          {title?.toUpperCase()}
        </Text>
        <div className="absolute bottom-0 w-full">
          <Separator size="4" />
        </div>
      </div>
      <motion.div className={className}>{children}</motion.div>
    </Card>
  );
});

TitleCard.displayName = "TitleCard";

export default Card;
