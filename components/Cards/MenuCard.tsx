"use client";

import { GridContext } from "@/lib/state";
import { cn } from "@/lib/utils";
import { Text, Tooltip } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import {
  MotionValue,
  motion,
  useAnimate,
  useAnimationControls,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Briefcase, FlaskRound, Home, LucideIcon, Users } from "lucide-react";
import {
  ComponentProps,
  MouseEvent,
  ReactNode,
  useContext,
  useRef,
} from "react";
import { useStore } from "zustand";
import Card from "../Card";
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
  const dist = useTransform(() => {
    if (!ref.current) return 0;
    const { width, left, top, height } = (
      ref.current as HTMLElement
    ).getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    return Math.sqrt(
      Math.pow(x.get() - centerX, 2) + Math.pow(y.get() - centerY, 2)
    );
  });

  const width = useTransform(
    dist,
    [0, size * maxSize * 1.5],
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
        className="aspect-square flex items-end justify-end w-g-x-1 relative rounded-full bg-[--sage-5] transition-all brightness-100 hover:brightness-75 z-10"
        variants={{
          leave: {
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

export default function MenuCard(props: ComponentProps<typeof Card>) {
  const { className, ...rest } = props;
  const store = useContext(GridContext)!;
  const pushElements = useStore(store).pushElements;
  const { gridUnitWidth } = useStore(store).grid;
  const [ref] = useAnimate();
  const controls = useAnimationControls();
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
      cards: [CARD_TYPES.Contacts, CARD_TYPES.Status, CARD_TYPES.Location],
    },
  };

  return (
    <Card
      {...rest}
      className={cn("absolute overflow-visible group", className)}
      ref={ref}
      initial="initial"
      id={CARD_TYPES.Menu}
      key={CARD_TYPES.Menu}
      onMouseMove={trackMouse}
      onMouseLeave={() => {
        controls.start("leave");
        x.set(0);
        y.set(0);
      }}
    >
      <motion.div
        animate={controls}
        className="flex absolute gap-4 items-end overflow-visible p-2 bottom-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 "
      >
        {Object.entries(items).map(([key, { icon: Icon, cards }], i) => (
          <Item
            key={i}
            text={key}
            {...{ x, y }}
            minSize={0.6}
            maxSize={0.85}
            size={gridUnitWidth}
            onClick={() => pushElements(cards)}
          >
            <Icon
              className="text-[--sage-11] m-auto"
              size={"28"}
              absoluteStrokeWidth
              strokeWidth={3}
            />
          </Item>
        ))}
        <div className="absolute transition-all h-full bottom-0 rounded-full group-hover:bg-[--sage-a2] bg-[--sage-a3] mix-blend-color-burn w-full left-0 -z-10" />
      </motion.div>
    </Card>
  );
}
