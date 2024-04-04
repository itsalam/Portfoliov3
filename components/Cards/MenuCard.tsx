"use client";

import { GridContext } from "@/lib/state";
import { cn } from "@/lib/utils";
import { Separator, Text, Tooltip } from "@radix-ui/themes";
import {
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Briefcase,
  FlaskRound,
  Home,
  LucideIcon,
  Moon,
  Users,
} from "lucide-react";
import {
  ComponentProps,
  MouseEvent,
  ReactNode,
  useContext,
  useLayoutEffect,
  useRef,
} from "react";

import { useTheme } from "next-themes";
import { useStore } from "zustand";
import { CARD_TYPES } from "./types";

const Item = (props: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  size: number;
  minSize: number;
  maxSize: number;
  children: ReactNode;
  text: string;
  onClick: (event: MouseEvent) => void;
}) => {
  const { children, text, x, y, onClick, minSize, maxSize, size } = props;
  const ref = useRef<HTMLButtonElement>(null);
  const domRect = useMotionValue<DOMRect | null>(null);
  const dist = useTransform(() => {
    const domVals = domRect.get();
    if (domVals === null) return size * maxSize;
    const { left, top, width, height } = domVals;
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    return Math.sqrt(
      Math.pow(x.get() - centerX, 2) + Math.pow(y.get() - centerY, 2)
    );
  });

  useLayoutEffect(() => {
    domRect.set((ref.current as HTMLElement).getBoundingClientRect());
  }, [domRect]);

  const width = useTransform(
    dist,
    [0, size * maxSize * 1.25],
    [size * maxSize, size * minSize]
  );

  const springWidth = useSpring(width, { stiffness: 650 });
  const iconScale = useSpring(
    useTransform(
      width,
      [size * minSize, size * maxSize],
      [1, 1 + (maxSize - minSize)]
    )
  );

  return (
    <Tooltip
      sideOffset={10}
      side="top"
      delayDuration={100}
      content={
        <Text className="font-favorit" size="3">
          {text}
        </Text>
      }
    >
      <motion.button
        ref={ref}
        style={{
          width: springWidth,
        }}
        className="w-g-5/8 relative z-[1000] flex aspect-square items-end justify-end rounded-full bg-[--gray-5] brightness-100 transition-all hover:bg-[--gray-2]"
        variants={{
          initial: {
            width: [null, size * minSize],
            transition: { stiffness: 650 },
          },
        }}
        onClick={onClick}
      >
        <motion.div className="m-auto" style={{ scale: iconScale }}>
          {children}
        </motion.div>
      </motion.button>
    </Tooltip>
  );
};

export default function MenuCard(props: ComponentProps<typeof motion.div>) {
  const { className, ...rest } = props;
  const { themes, resolvedTheme, setTheme } = useTheme();
  const store = useContext(GridContext)!;
  const pushElements = store.getInitialState().pushElements;
  const { gridCellSize } = useStore(store).gridInfo;
  const x = useMotionValue(0),
    y = useMotionValue(0);

  const trackMouse = (ev: MouseEvent) => {
    x.set(ev.clientX);
    y.set(ev.clientY);
  };

  const items: Record<string, { icon: LucideIcon; cards: CARD_TYPES[] }> = {
    Home: { icon: Home, cards: [CARD_TYPES.Home] },
    Projects: { icon: FlaskRound, cards: [CARD_TYPES.Projects] },
    Work: { icon: Briefcase, cards: [CARD_TYPES.Experience] },
    Info: {
      icon: Users,
      cards: [CARD_TYPES.Resume, CARD_TYPES.Location, CARD_TYPES.Contacts],
    },
  };

  return (
    <motion.div
      {...rest}
      className={cn("group absolute z-50 overflow-visible", className)}
      initial="initial"
      animate="animate"
      id={CARD_TYPES.Menu}
      key={CARD_TYPES.Menu}
      whileHover={"hover"}
      onMouseMove={trackMouse}
      onMouseLeave={() => {
        // controls.start("leave");
        x.set(0);
        y.set(0);
      }}
      variants={{
        animate: {
          width: [null, gridCellSize * 3],
          height: [null, gridCellSize * 1],
          transition: {
            duration: 0.1,
          },
        },
        hover: {},
      }}
    >
      <motion.div
        // animate={controls}
        variants={{
          initial: { height: 16 + gridCellSize / 2 },
        }}
        className="card absolute bottom-0 left-1/2 z-[1000] flex -translate-x-1/2 items-end gap-4 overflow-visible rounded-full p-2 backdrop-brightness-50 transition-all group-hover:bg-[--gray-a3] group-hover:backdrop-brightness-75"
      >
        {Object.entries(items).map(([key, { icon: Icon, cards }]) => (
          <Item
            key={key}
            text={key}
            {...{ x, y }}
            minSize={0.5}
            maxSize={0.85}
            size={gridCellSize}
            onClick={() => pushElements(cards)}
          >
            <Icon
              className="m-auto text-[--gray-11]"
              size={"20"}
              absoluteStrokeWidth
              strokeWidth={2}
            />
          </Item>
        ))}
        <Separator orientation="vertical" size="4" className="h-full py-1" />
        <Item
          text={"Toggle Theme"}
          {...{ x, y }}
          minSize={0.5}
          maxSize={0.85}
          size={gridCellSize}
          onClick={() => {
            setTheme(
              themes[themes.findIndex((theme) => theme === resolvedTheme) ^ 1]
            );
          }}
        >
          <Moon
            className="m-auto text-[--gray-11]"
            size={"20"}
            absoluteStrokeWidth
            strokeWidth={2}
          />
        </Item>
        <motion.div className="absolute" />
      </motion.div>
    </motion.div>
  );
}
