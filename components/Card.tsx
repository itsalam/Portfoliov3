"use client";

import { GridContext } from "@/lib/state";
import { clamp, cn } from "@/lib/utils";
import { Separator, Text } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import {
  AnimationControls,
  PanInfo,
  motion,
  useAnimationControls,
  useDragControls,
} from "framer-motion";
import { Lock, LockOpen, X } from "lucide-react";
import {
  ComponentPropsWithoutRef,
  ElementRef,
  PointerEvent,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useStore } from "zustand";
import { CARD_TYPES } from "./Cards/types";

const Card = forwardRef<
  ElementRef<typeof motion.div>,
  ComponentPropsWithoutRef<typeof motion.div> & {
    initCoords?: [number, number];
    width?: number;
    height?: number;
    close?: () => void;
    isLocked?: boolean;
  }
>((props, ref) => {
  const {
    animate,
    className,
    children,
    initCoords,
    isLocked,
    onDragEnd,
    ...rest
  } = props;
  const defaultAnimationControls = useAnimationControls();
  const animationControls = useRef(
    (animate as AnimationControls) || defaultAnimationControls
  );
  const context = useContext(GridContext)!;
  const grid = useStore(context, (state) => state.grid);

  useEffect(() => {
    animationControls.current.start("open");
  }, []);

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | globalThis.PointerEvent,
    info: PanInfo
  ) => {
    if (!ref || typeof ref === "function" || !ref.current) return;
    setTimeout(() => {
      const { x, y, width, height } = ref.current!.getBoundingClientRect();
      const { gridCellHeight, gridCellWidth, numCols, numRows } = grid;
      // Get the last two matches and convert them to numbers
      gridCoords.current = [
        clamp(
          Math.round(x / gridCellWidth),
          1,
          numCols - width / gridCellWidth - 1
        ),
        clamp(
          Math.round(y / gridCellHeight),
          1,
          numRows - height / gridCellHeight - 1
        ),
      ];
      const fixedX = gridCoords.current[0] * gridCellWidth;
      const fixedY = gridCoords.current[1] * gridCellHeight;
      animationControls.current.start({
        x: [null, fixedX],
        y: [null, fixedY],
        transition: { damping: 30, stiffness: 10 },
      });

      onDragEnd?.(event, info);
    }, 400);
  };

  const gridCoords = useRef(initCoords ?? [0, 0]);

  return (
    <motion.div
      initial={{
        width: 0,
        height: 0,
      }}
      drag={!isLocked}
      dragTransition={{
        power: 0.2,
        timeConstant: 50,
      }}
      onDragEnd={handleDragEnd}
      className={cn(
        "card origin-top-left overflow-hidden absolute transition-all",
        className
      )}
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
  ComponentPropsWithoutRef<typeof Card> & {
    containerClassName?: string;
  }
>((props, ref) => {
  const {
    containerClassName,
    className,
    id,
    children,
    title,
    width,
    height,
    ...rest
  } = props;
  const dragControls = useDragControls();
  const [isDrag, setIsDrag] = useState(false);
  const { closeElements, lockElements } = useContext(GridContext)!.getState();
  const { elements } = useStore(useContext(GridContext)!);
  const isLocked = elements.find((e) => e.id === id)?.isLocked;

  function startDrag(event: PointerEvent) {
    if (event.target.getAttribute("data-button") === "true") {
      // The event comes from a button inside the trackbar, ignore it for dragging
      return;
    }
    event.preventDefault();
    dragControls.start(event);
    setIsDrag(true);
  }

  function endDrag() {
    setIsDrag(false);
  }

  const Button = forwardRef<
    HTMLButtonElement,
    ComponentPropsWithoutRef<typeof motion.button>
  >(({ className, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        data-button="true"
        whileTap={{ scale: 0.95, y: -2 }}
        className={cn(
          className,
          "rounded-full transition-all border-[1px] border-[--sage-a4] hover:border-[--sage-a8] aspect-square flex justify-center items-center z-50"
        )}
        {...props}
      />
    );
  });
  Button.displayName = "Button";

  return (
    <Card
      className={cn(
        "flex flex-col group border-[1px] border-[--sage-a3] hover:border-[--sage-10] backdrop-blur-sm bg-[--black-a6] hover:bg-[--black-a4]",
        containerClassName,
        {
          "border-[--sage-12]": isDrag,
        }
      )}
      ref={ref}
      dragControls={dragControls}
      dragListener={false}
      onDragEnd={endDrag}
      id={id}
      variants={{
        close: {
          opacity: 0,
          width: 0,
        },
        open: {
          width: [0, width, width],
          height: [24, 24, height],
          opacity: [0, 1, 1],
          transition: {
            duration: 0.33,
          },
        },
      }}
      isLocked={isLocked}
      {...rest}
    >
      <motion.div
        onPointerDown={startDrag}
        draggable={false}
        className={cn(
          "flex opacity-50 group-hover:opacity-100 transition-opacity flex-col px-3 py-1 h-6 relative bg-[--gray-a3] justify-center",
          {
            "opacity-100": isDrag,
          }
        )}
        variants={{
          open: {},
        }}
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
        <div className="absolute right-1 h-3/4 flex gap-1 z-50">
          <Button onClick={() => id && lockElements([id as CARD_TYPES])}>
            {isLocked ? <Lock size={10} /> : <LockOpen size={10} />}
          </Button>
          <Button onClick={() => id && closeElements([id as CARD_TYPES])}>
            <X size={9} />
          </Button>
        </div>
      </motion.div>
      <motion.div
        variants={{
          open: {
            height: ["0%", "0%", "100%"],
            transition: {
              delay: 0.43,
              duration: 0.66,
            },
          },
        }}
        className={cn(className, "overflow-hidden z-30")}
      >
        {children}
      </motion.div>
    </Card>
  );
});

TitleCard.displayName = "TitleCard";

export default Card;
