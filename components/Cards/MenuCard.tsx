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
  useLayoutEffect,
  useRef,
  useState,
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
  const [domRect, setDomRect] = useState<DOMRect>();
  const dist = useTransform(() => {
    if (!domRect) return size * maxSize;
    const { left, top, width, height } = domRect;
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    return Math.sqrt(
      Math.pow(x.get() - centerX, 2) + Math.pow(y.get() - centerY, 2)
    );
  });

  useLayoutEffect(() => {
    setDomRect((ref.current as HTMLElement).getBoundingClientRect());
  }, []);

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
        className="relative z-[1000] flex aspect-square w-g-x-5/8 items-end justify-end rounded-full bg-[--sage-5] brightness-100 transition-all hover:bg-[--sage-2]"
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
  const pushElements = store.getInitialState().pushElements;
  const { gridUnitWidth, gridUnitHeight } = useStore(store).gridInfo;
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
      cards: [CARD_TYPES.Contacts, CARD_TYPES.Location],
    },
  };

  return (
    <Card
      {...rest}
      className={cn("group absolute z-50 overflow-visible", className)}
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
      width={3 * gridUnitWidth}
      height={1 * gridUnitHeight}
      isLocked
    >
      <motion.div
        animate={controls}
        className="absolute bottom-0 left-1/2 top-1/3 z-[1000] flex -translate-x-1/2 items-end gap-4 overflow-visible rounded-full bg-[--sage-a4] p-2 group-hover:bg-[--sage-a3]"
      >
        {Object.entries(items).map(([key, { icon: Icon, cards }]) => (
          <Item
            key={key}
            text={key}
            {...{ x, y }}
            minSize={0.6}
            maxSize={0.85}
            size={(gridUnitWidth * 3) / 4}
            onClick={() => pushElements(cards)}
          >
            <Icon
              className="m-auto text-[--sage-11]"
              size={"20"}
              absoluteStrokeWidth
              strokeWidth={2}
            />
          </Item>
        ))}
      </motion.div>
    </Card>
  );
}
