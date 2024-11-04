"use client";

import { isWebGLSupported } from "@/lib/providers/clientUtils";
import { cn } from "@/lib/utils";
import { Text as RadixText } from "@radix-ui/themes";
import { AnimatePresence, Variants, m } from "framer-motion";
import React, {
  ComponentProps,
  ComponentType,
  useCallback,
  useEffect,
  useState,
} from "react";

const MText = m(RadixText);

type AnimateTextProps = {
  text: string;
  variants?: Variants;
  containerVariants?: Variants;
};

const TIMES = [3 / 12, 4 / 12, 7 / 12, 8 / 12, 11 / 12, 12 / 12];

enum Animation {
  Enter = "Enter",
  Leave = "Leave",
  Hide = "Hide",
  Show = "Show",
}

const AnimationValues: Record<Animation, [number, number]> = {
  [Animation.Enter]: [-1, 0],
  [Animation.Leave]: [0, 1],
  [Animation.Hide]: [-1, -1],
  [Animation.Show]: [0, 0],
};

export const RotateText: React.FC<
  React.ComponentProps<typeof MText> &
    AnimateTextProps & {
      distance?: number;
      range?: [number, number];
      length?: number;
    }
> = (props) => {
  const {
    distance = -100,
    range = [0, 1],
    length = 3,
    variants,
    ...otherProps
  } = props;
  const [enterIdx, leaveIdx] = range;

  const webgl = isWebGLSupported();

  const animations: Animation[] = Array(length)
    .fill(Animation.Hide)
    .map((val, index) =>
      index === enterIdx
        ? Animation.Enter
        : index === leaveIdx
          ? Animation.Leave
          : val)
    .map((val, i) => (i > enterIdx && i < leaveIdx ? Animation.Show : val));

  const y: string[] = animations
    .map((a) => AnimationValues[a])
    .flat(1)
    .map((val) => `${val * distance}%`);

  const times = animations.map((a, i) => {
    return a !== Animation.Hide ? [TIMES[i * 2], TIMES[1 + i * 2]] : null;
  });

  const opacity = y.map((val) => {
    const num = Number(val.match(/\d+/));
    return num === 0 ? 1 : num < 0 ? 0.3 : 0;
  });

  const rotateX: number[] = animations
    .map((a) => AnimationValues[a])
    .flat(1)
    .map((val) => val * 90);

  const filter = opacity.map((val) => `blur(${Math.round((1 - val) * 2)}px)`);

  return (
    <AnimateText
      className="w-min origin-center"
      initial={{
        rotateX: rotateX[0],
        opacity: opacity[0],
        transformOrigin: "center center -40px",
      }}
      variants={{
        rotate: {
          rotateX: [null, ...rotateX],
          // y: [null, ...y],
          opacity: [null, ...opacity],
          ...(webgl && { filter: [null, ...filter] }),
          transition: {
            duration: 12,
            times: [0, 3 / 12, 4 / 12, 7 / 12, 8 / 12, 11 / 12, 12 / 12],
            repeatDelay: 1,
            delay: 1,
            repeat: webgl ? Infinity : 2,
          },
        },
        stop: {
          // y: y.slice(-2),
          opacity: opacity.slice(-2),
          filter: filter.slice(-2),
          rotateX: rotateX.slice(-2),
          transition: {
            duration: 1,
          },
        },
        ...variants,
      }}
      {...otherProps}
    />
  );
};

export const AnimateText: React.FC<
  React.ComponentProps<typeof MText> & AnimateTextProps
> = (props) => {
  const { text, className, variants, ...textProps } = props;
  return (
    <MText
      key={text}
      className={cn(
        "relative", // basicStyles
        "my-auto flex origin-[50%_50%_4rem]", // margin, sizing, transforms
        "overflow-y-hidden whitespace-nowrap", // overflowControl, textWrapping
        className
      )}
      variants={variants}
      {...textProps}
    >
      {text}
    </MText>
  );
};

export const AnimatedText = (
  props: {
    className?: string;
    text: string;
    textChild: ComponentType<
      ComponentProps<typeof RadixText> & { text: string }
    >;
    reverse?: boolean;
  } & ComponentProps<typeof m.div>
) => {
  const { className, text, textChild: Text, reverse, ...others } = props;
  const [prevText, setPrevText] = useState("");
  const [currText, setCurrText] = useState("");

  useEffect(() => {
    if (text !== currText) {
      setPrevText(currText);
      setCurrText(text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const PresenceText = useCallback(
    (props: ComponentProps<typeof m.div>) => (
      <m.div
        className="absolute top-0 h-full"
        initial={{
          opacity: 0,
        }}
        exit={"exit"}
        animate={"animate"}
        variants={{
          animate: (reverse) =>
            reverse
              ? {
                  y: ["-100%", "0%"],
                  opacity: [null, 1],
                }
              : {
                  y: ["100%", "0%"],
                  opacity: [null, 1],
                },
          exit: (reverse) =>
            reverse
              ? {
                  y: ["0%", "100%"],
                  opacity: [null, 0],
                }
              : {
                  y: ["0%", "-100%"],
                  opacity: [null, 0],
                },
        }}
        transition={{ duration: 0.4 }}
        {...props}
      />
    ),
    []
  );

  return (
    <m.div
      className={cn(
        "relative overflow-hidden",
        className
      )}
      style={{
        perspective: "100px",
      }}
      {...others}
    >
      <AnimatePresence mode="sync" initial={false} custom={reverse}>
        {currText === text && (
          <PresenceText key={currText} custom={reverse}>
            <Text text={currText} />
          </PresenceText>
        )}
        {currText !== text && (
          <PresenceText key={prevText} custom={reverse}>
            <Text text={prevText} />
          </PresenceText>
        )}
      </AnimatePresence>
      <Text
        className="relative opacity-0"
        text={currText}
      />
    </m.div>
  );
};
