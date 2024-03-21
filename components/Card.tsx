"use client";

import { GridContext } from "@/lib/state";
import { cn } from "@/lib/utils";
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
  CSSProperties,
  ComponentPropsWithoutRef,
  ElementRef,
  PointerEvent,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CARD_TYPES } from "./Cards/types";

const Card = forwardRef<
  ElementRef<typeof motion.div>,
  ComponentPropsWithoutRef<typeof motion.div> & {
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
    id,
    width,
    height,
    isLocked: propsIsLocked,
    ...rest
  } = props;

  const defaultAnimationControls = useAnimationControls();
  const animationControls = useRef(
    (animate as AnimationControls) || defaultAnimationControls
  );
  const isLocked = propsIsLocked;

  useEffect(() => {
    animationControls.current.start("open");
  }, []);

  return (
    <motion.div
      initial={{
        width: 0,
        height: 0,
      }}
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
            duration: 0.466,
          },
        },
      }}
      drag={!isLocked}
      dragTransition={{
        power: 0.02,
        timeConstant: 50,
      }}
      className={cn("card origin-top-left absolute transition-all", className)}
      animate={animationControls.current}
      ref={ref}
      id={id}
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
    isLocked,
    onDragEnd,
    ...rest
  } = props;
  const dragControls = useDragControls();
  const [isDrag, setIsDrag] = useState(false);
  const { closeElements, lockElements } = useContext(GridContext)!.getState();

  function startDrag(event: PointerEvent) {
    let target = event.target as HTMLElement;
    if (target.tagName !== "BUTTON") {
      // Find the button parent of the SVG or other target elements
      target = target.closest("button") as HTMLElement;
      if (target && target.getAttribute("data-button") === "true") {
        return;
      }
    }
    dragControls.start(event);
    setIsDrag(true);
  }

  function endDrag(
    event: MouseEvent | TouchEvent | globalThis.PointerEvent,
    info: PanInfo
  ) {
    onDragEnd?.(event, info);
    setIsDrag(false);
  }

  const Button = forwardRef<
    HTMLButtonElement,
    ComponentPropsWithoutRef<typeof motion.button>
  >(({ className, onClick, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        data-button="true"
        whileTap={{ scale: 1.05, y: -6 }}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(e);
        }}
        className={cn(
          className,
          "rounded-full transition-all border-[1px] border-[--sage-a7] hover:border-[--sage-a10] aspect-square flex justify-center items-center z-50"
        )}
        {...props}
      />
    );
  });
  Button.displayName = "Button";

  return (
    <Card
      className={cn(
        "w-0 h-0",
        "flex flex-col group border-[1px] border-[--sage-a3] hover:border-[--sage-10] backdrop-blur-sm bg-[--black-a6] hover:bg-[--black-a4] overflow-hidden",
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
      isLocked={isLocked}
      {...rest}
    >
      <motion.div
        onPointerDown={startDrag}
        draggable={false}
        className={cn(
          "z-10 flex opacity-50 group-hover:opacity-100 transition-opacity flex-col px-3 py-1 h-6 relative bg-[--gray-a3] justify-center",
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
          style={{ ["--letter-spacing"]: "0.02em" } as CSSProperties}
        >
          {title?.toUpperCase()}
        </Text>
        <div className="absolute left-0 bottom-0 w-full">
          <Separator size="4" />
        </div>
        <div className="absolute right-1 h-3/4 flex gap-1 z-50">
          <Button
            className={cn(
              { "opacity-50": !isLocked },
              "hover:opacity-100 transition-opacity"
            )}
            onClick={() => id && lockElements([id as CARD_TYPES])}
          >
            {isLocked ? <Lock size={10} /> : <LockOpen size={10} />}
          </Button>
          <Button onClick={() => id && closeElements([id as CARD_TYPES])}>
            <X size={9} />
          </Button>
        </div>
      </motion.div>
      <motion.div className={cn(className, "overflow-hidden z-30")}>
        {children}
      </motion.div>
    </Card>
  );
});

TitleCard.displayName = "TitleCard";

export default Card;
