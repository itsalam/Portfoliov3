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
import { X } from "lucide-react";
import { useTheme } from "next-themes";
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
  useRef
} from "react";
import { CARD_TYPES } from "./types";

const Card: FC<
  ComponentProps<typeof motion.div> & {
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

  const animation = useMemo(
    () =>
      debounce(() => {
        if (!ref.current) return;
        if (initialLoad.current) {
          animate(ref.current, {
            x: [null, x, x],
            y: [null, y, y],
            opacity: [null, 1, 1],
            width: [null, null, width],
            height: [null, null, height],
            transition: {
              type: "spring",
              duration: 0.133,
            },
          } as DOMKeyframesDefinition);
          initialLoad.current = false;
        } else {
          console.log(initialLoad);
          animate(
            ref.current,
            {
              x: [null, x, x],
              y: [null, y, y],
              width: [null, null, width],
              height: [null, null, height],
            } as DOMKeyframesDefinition,
            { duration: 0.001 }
          );
        }
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
  const { resolvedTheme } = useTheme();
  const { closeElements } = useContext(GridContext)!.getState();

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
          className,
          "z-50 flex aspect-square w-5 items-center justify-center rounded-full border-[1px] border-[--gray-a7] transition-all hover:border-[--gray-a10]"
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
        "hover:border-[--gray-a7] "
      )}
      dragControls={dragControls}
      dragListener={false}
      onDragEnd={endDrag}
      id={id}
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
          "group relative z-10 flex h-8 flex-col justify-center bg-[--gray-a3] px-3 py-1 opacity-100 transition-opacity"
        )}
      >
        <Text
          size="2"
          className="color-[--gray-a4] w-fit font-light"
          style={{ ["--letter-spacing"]: "0.02em" } as CSSProperties}
        >
          {title}
        </Text>
        <Separator
          className="absolute bottom-0 left-0 w-full bg-[--gray-a3] transition-all group-hover:bg-[--gray-a7]"
          size="4"
        />

        <div className="absolute right-1 z-50 flex h-2/3 gap-1">
          <Button onClick={() => id && closeElements([id as CARD_TYPES])}>
            <X size={9} />
          </Button>
        </div>
      </motion.div>
      <motion.div
        className={cn(
          className,
          "card-bg z-30 h-[inherit] overflow-hidden opacity-0",
          {
            "hover:bg-[--gray-1]": resolvedTheme === "light",
            "dark:hover:bg-[--gray-2]": resolvedTheme !== "light",
          }
        )}
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
