"use client";

import { GridContext } from "@/lib/state";
import { cn } from "@/lib/utils";
import { Separator, Text } from "@radix-ui/themes";
import {
  DOMKeyframesDefinition,
  PanInfo,
  animate,
  motion,
  useDragControls,
} from "framer-motion";
import { debounce } from "lodash";
import { Maximize, X } from "lucide-react";
import {
  CSSProperties,
  ComponentProps,
  ComponentPropsWithoutRef,
  FC,
  PointerEvent,
  forwardRef,
  useContext,
  useEffect,
  useRef,
} from "react";
import { CARD_TYPES } from "./types";

const Card: FC<
  ComponentProps<typeof motion.div> & {
    canExpand?: boolean;
    width?: number;
    height?: number;
    x: number;
    y: number;
    close?: () => void;
  }
> = (props) => {
  const { x, y, className, children, id, height, width, ...rest } = props;
  const ref = useRef<HTMLDivElement>(null);
  const initialLoad = useRef(true);

  const animation = debounce(() => {
    if (!ref.current) return;
    if (initialLoad.current) {
      animate(ref.current, {
        opacity: [null, 1],
        width: [32, width],
        height: [32, height],
      } as DOMKeyframesDefinition);
      initialLoad.current = false;
    }
  }, 10);

  useEffect(() => {
    animation();
  }, [animation]);

  return (
    <motion.div
      onAnimationStart={console.log}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      initial={{
        width: 32,
        height: 32,
        opacity: 0,
      }}
      animate={{
        width,
        height,
        opacity: 1,
      }}
      style={{
        x,
        y,
      }}
      className={cn("card absolute origin-top-left transition-all", className)}
      ref={ref}
      id={id}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export const TitleCard: FC<ComponentProps<typeof Card>> = (props) => {
  const {
    canExpand,
    className,
    id,
    children,
    title,
    onDragEnd,
    width,
    height,
    x,
    y,
    ...rest
  } = props;
  const dragControls = useDragControls();
  const { closeElements, toggleCard } = useContext(GridContext)!.getState();

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
  }

  function endDrag(
    event: MouseEvent | TouchEvent | globalThis.PointerEvent,
    info: PanInfo
  ) {
    onDragEnd?.(event, info);
  }

  return (
    <Card
      className={cn(
        "group/card border-[1px] hover:shadow-xl dark:hover:shadow-none",
        "flex h-0 w-0 flex-col overflow-hidden", // sizing, layout, overflowControl
        "border-[--gray-a3] hover:border-[--gray-a7]" // border
      )}
      dragControls={dragControls}
      dragListener={false}
      onDragEnd={endDrag}
      id={id}
      width={width}
      height={height}
      x={x}
      y={y}
      {...rest}
    >
      <motion.div
        onPointerDown={startDrag}
        draggable={false}
        className={cn(
          "relative", // basicStyles
          "z-10 flex h-8 flex-col justify-center", // layoutControl, sizing, layout
          "bg-[--gray-a3] opacity-100", // background, transparency
          "transition-opacity dark:backdrop-brightness-75" // filters, transitionsAnimations
        )}
        variants={{
          expand: {
            opacity: [null, 0],
            height: [null, 0],
          },
          minimize: {
            opacity: [null, 1],
            height: [null, "32px"],
          },
        }}
      >
        <Text
          size="2"
          className={cn(
            "color-[--gray-a4] user-select-none select-none",
            "pointer-events-none w-fit px-3 py-1", // basicStyles, sizing, padding
            "font-light group-hover/card:text-[--accent-11]", // textStyles
            "transition-colors" // transitionsAnimations
          )}
          style={{ ["--letter-spacing"]: "0.02em" } as CSSProperties}
        >
          {title}
        </Text>
        <Separator
          className={cn(
            "absolute", // basicStyles
            "bottom-0 left-0 w-full", // positioning, sizing
            "bg-[--gray-a3] group-hover/card:bg-[--gray-a7]", // background
            "transition-all" // transitionsAnimations
          )}
          size="4"
        />

        <div className="absolute right-1 z-50 flex h-5 gap-1">
          {canExpand && (
            <Button
              onClick={() => {
                id && toggleCard(id as CARD_TYPES);
              }}
            >
              <Maximize size={10} />
            </Button>
          )}
          <Button onClick={() => id && closeElements([id as CARD_TYPES])}>
            <X size={10} />
          </Button>
        </div>
      </motion.div>
      <motion.div
        className={cn(
          "card-bg z-30 h-full overflow-hidden opacity-0",
          className
        )}
        animate={{
          opacity: [0, 1],
          transition: {
            duration: 0.5,
            delay: 1.25,
          },
        }}
        variants={{
          expand: {
            backgroundColor: [null, "transparent"],
            "--backdrop-blur": [null, 0],
            "--backdrop-brightness": [null, 1.0],
            opacity: [null, 0.2, 1],
          },
          minimize: {
            "--backdrop-blur": [null, "var(--blur-fallback)"],
            "--backdrop-brightness": [null, "var(--brightness-fallback)"],
            backgroundColor: [null, "var(--card-background-color)"],
            opacity: [null, 0.2, 1],
          },
        }}
      >
        {children}
      </motion.div>
    </Card>
  );
};

TitleCard.displayName = "TitleCard";

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
      style={{
        aspectRatio: "1 / 1",
      }}
      className={cn(
        "border-[1px]",
        "z-50 flex aspect-square w-5", // layoutControl, sizing
        "items-center justify-center", // layout
        "rounded-full border-[--gray-a7] hover:border-[--accent-a10]", // border
        "transition-all hover:text-[--accent-a10]", // textStyles, transitionsAnimations
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";

export default Card;
