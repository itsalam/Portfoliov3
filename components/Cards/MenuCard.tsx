"use client";

import { GridContext } from "@/lib/state";
import { cn } from "@/lib/utils";
import { Separator, Text, Tooltip } from "@radix-ui/themes";
import {
  AnimatePresence,
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
  Sun,
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

const MoonIcon = motion(Moon);
const SunIcon = motion(Sun);

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
  });

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
        <Text className="" size="3">
          {text}
        </Text>
      }
    >
      <motion.button
        ref={ref}
        style={{
          width: springWidth,
        }}
        className="relative z-[1000] flex aspect-square w-g-5/8 items-end justify-end rounded-full bg-[--gray-5] brightness-100 transition-all hover:bg-[--gray-2]"
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
      className={cn("safe-pb group absolute z-50 overflow-visible", className)}
      initial="initial"
      animate="animate"
      id={"Menu"}
      key={"Menu"}
      whileHover={"hover"}
      onMouseMove={trackMouse}
      onMouseLeave={() => {
        // controls.start("leave");
        x.set(0);
        y.set(0);
      }}
      variants={{
        animate: {
          width: [null, 350],
          height: [null, Math.max(64, gridCellSize * 1)],
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
          initial: { height: 64 },
        }}
        className="menu-bg absolute bottom-0 left-1/2 z-[1000] flex -translate-x-1/2 items-end gap-4 overflow-visible rounded-full p-2 backdrop-brightness-50 transition-all group-hover:bg-[--gray-a3] group-hover:backdrop-brightness-75"
      >
        {Object.entries(items).map(([key, { icon: Icon, cards }]) => (
          <Item
            key={key}
            text={key}
            {...{ x, y }}
            minSize={0.5}
            maxSize={0.85}
            size={96}
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
          size={96}
          onClick={() => {
            setTheme(
              themes[themes.findIndex((theme) => theme === resolvedTheme) ^ 1]
            );
          }}
        >
          <AnimatePresence mode="wait">
            {resolvedTheme === themes[0] && (
              <MoonIcon
                className="m-auto text-[--gray-11]"
                size={"20"}
                key="moon"
                absoluteStrokeWidth
                strokeWidth={2}
                initial={{ rotate: -45, y: -5, opacity: 0.5 }}
                animate={{ rotate: 0, y: 0, opacity: 1 }}
                exit={{ rotate: 45, y: -5, opacity: 0.5 }}
                transition={{ duration: 0.2 }}
              />
            )}
            {resolvedTheme === themes[1] && (
              <SunIcon
                className="m-auto text-[--gray-11]"
                size={"20"}
                key="sun"
                absoluteStrokeWidth
                strokeWidth={2}
                initial={{ rotate: -45, y: -5, opacity: 0.5 }}
                animate={{ rotate: 0, y: 0, opacity: 1 }}
                exit={{ rotate: 45, y: -5, opacity: 0.5 }}
                transition={{ duration: 0.2 }}
              />
            )}
          </AnimatePresence>
        </Item>
        <motion.div className="absolute" />
      </motion.div>
    </motion.div>
  );
}
