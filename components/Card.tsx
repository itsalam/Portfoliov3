"use client";

import { GridContext } from "@/lib/state";
import { cn } from "@/lib/utils";
import { Separator, Text } from "@radix-ui/themes";
import { PanInfo, animate, motion, useDragControls } from "framer-motion";
import { debounce } from "lodash";
import { Lock, LockOpen, X } from "lucide-react";
import {
  CSSProperties,
  ComponentProps,
  ComponentPropsWithoutRef,
  FC,
  PointerEvent,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CARD_TYPES } from "./Cards/types";

const Card: FC<
  ComponentProps<typeof motion.div> & {
    width?: number;
    height?: number;
    x: number;
    y: number;
    close?: () => void;
    isLocked?: boolean;
  }
> = (props) => {
  const { x, y, className, children, id, isLocked, height, width, ...rest } =
    props;
  const ref = useRef(null);
  const initialLoad = useRef(true);

  const animation = useMemo(
    () =>
      debounce(() => {
        animate(ref.current, {
          x: [null, x, x],
          y: [null, y, y],
          opacity: [null, 1, 1],
          width: [null, null, width],
          height: [null, null, height],
          transition: {
            type: initialLoad.current ? "spring" : "tween",
            duration: initialLoad.current ? 0.133 : 0.001,
          },
        });
        initialLoad.current = false;
      }, 10),
    [height, width, x, y]
  );

  useEffect(() => {
    animation();
  }, [animation]);

  return (
    <motion.div
      initial={{
        width: 0,
        height: 0,
        opacity: 0,
      }}
      drag={!isLocked}
      className={cn("card absolute origin-top-left transition-all", className)}
      ref={ref}
      id={id}
      width={width}
      height={height}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export const TitleCard: FC<ComponentProps<typeof Card>> = (props) => {
  const {
    className,
    id,
    children,
    title,
    isLocked,
    onDragEnd,
    width,
    height,
    x,
    y,
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
          "z-50 flex aspect-square items-center justify-center rounded-full border-[1px] border-[--gray-a7] transition-all hover:border-[--gray-a10]"
        )}
        {...props}
      />
    );
  });
  Button.displayName = "Button";

  return (
    <Card
      className={cn(
        "h-0 w-0",
        "group flex flex-col overflow-hidden",
        "border-[1px] border-[--gray-a3]",
        "hover:border-[--gray-10] hover:bg-[--gray-a4] ",
        {
          "border-[--gray-12]": isDrag,
        }
      )}
      dragControls={dragControls}
      dragListener={false}
      onDragEnd={endDrag}
      id={id}
      isLocked={isLocked}
      variants={{
        exit: {
          opacity: 0,
          width: 0,
          height: 0,
        },
      }}
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
          "group relative z-10 flex h-6 flex-col justify-center bg-[--gray-a3] px-3 py-1 opacity-100 transition-opacity",
          {
            "opacity-50": isDrag,
          }
        )}
      >
        <Text
          size="2"
          className="w-fit font-favorit"
          style={{ ["--letter-spacing"]: "0.02em" } as CSSProperties}
        >
          {title?.toUpperCase()}
        </Text>
        <div className="absolute bottom-0 left-0 w-full bg-[--gray-a1] transition-all group-hover:bg-[--gray-a10]">
          <Separator size="4" />
        </div>
        <div className="absolute right-1 z-50 flex h-3/4 gap-1">
          <Button
            className={cn(
              { "opacity-50": !isLocked },
              "transition-opacity hover:opacity-100"
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
      <motion.div
        className={cn(className, "z-30 h-[inherit] overflow-hidden opacity-0")}
        animate={{
          opacity: [0, 1],
          transition: {
            duration: 0.5,
            delay: 1.25,
          },
        }}
      >
        {children}
      </motion.div>
    </Card>
  );
};

TitleCard.displayName = "TitleCard";

export default Card;
