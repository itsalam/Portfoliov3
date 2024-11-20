"use client";

import { isWebGLSupported } from "@/lib/providers/clientUtils";
import { cn } from "@/lib/utils";
import { Text as RadixText } from "@radix-ui/themes";
import { AnimatePresence, Variants, m } from "framer-motion";
import React, { ComponentProps, ComponentType, useCallback } from "react";

const MText = m(RadixText);

type AnimateTextProps = {
  text: string;
  variants?: Variants;
  containerVariants?: Variants;
};

enum Animation {
  Enter = "Enter",
  EnterReverse = "EnterReverse",
  Leave = "Leave",
  LeaveReverse = "LeaveReverse",
  Hide = "Hide",
  Show = "Show",
}

const AnimationValues: Record<Animation, [number, number]> = {
  [Animation.Enter]: [-1, 0],
  [Animation.EnterReverse]: [1, 0],
  [Animation.Leave]: [0, 1],
  [Animation.LeaveReverse]: [0, -1],
  [Animation.Hide]: [-1, -1],
  [Animation.Show]: [0, 0],
};

const getAnimationsFromValues = (animValues: Animation[], webgl?: boolean) => {
  const y = animValues.map((a) => AnimationValues[a]).flat(1);
  const opacity = animValues
    .map((a) => AnimationValues[a])
    .map((vals) => {
      if (vals.every((val) => val === 0)) {
        return [1, 1];
      } else if (vals.every((val) => Math.abs(val) === 1)) {
        return [0, 0];
      } else {
        return vals.map((val) => (val === 0 ? 1 : 0));
      }
    })
    .flat();

  const rotateX = webgl ? y.map((val) => val * 90) : [];

  const filter = webgl
    ? opacity.map((val) => `blur(${Math.round((1 - val) * 2)}px)`)
    : [];

  return {
    opacity,
    rotateX,
    filter,
  };
};

export const HeroText: React.FC<
  React.ComponentProps<typeof MText> &
    AnimateTextProps & {
      range?: [number, number];
      length?: number;
    }
> = (props) => {
  const { range = [0, 1], length = 3, variants, ...otherProps } = props;
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

  const { opacity, filter, rotateX } = getAnimationsFromValues(
    animations,
    webgl
  );

  return (
    <MotionText
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

export const MotionText: React.FC<
  React.ComponentProps<typeof MText> & AnimateTextProps
> = (props) => {
  const { text, className, variants, ...textProps } = props;
  return (
    <MText
      key={text}
      className={cn(
        "relative", // basicStyles
        "my-auto flex origin-[50%_50%_-4rem]", // margin, sizing, transforms
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
  const webgl = isWebGLSupported();

  // console.log({text, currText, prevText})

  const enterAnims = getAnimationsFromValues(
    [!reverse ? Animation.Enter : Animation.EnterReverse],
    webgl
  );

  const exit = getAnimationsFromValues(
    [!reverse ? Animation.Leave : Animation.LeaveReverse],
    webgl
  );

  const PresenceText = useCallback(
    (props: ComponentProps<typeof m.div>) => (
      <m.div
        className="absolute top-0 h-full origin-[50%_50%_-4rem]"
        initial={{
          opacity: 0,
        }}
        exit={"exit"}
        animate={"animate"}
        variants={{
          animate: { ...enterAnims },
          exit: {
            opacity: [null, ...exit.opacity.slice(-1)],
            rotateX: [null, ...exit.rotateX.slice(-1)],
            filter: [null, ...exit.filter.slice(-1)],
          },
        }}
        transition={{
          stiffness: 40,
          damping: 20,
          mass: 10,
        }}
        {...props}
      />
    ),
    [enterAnims, exit.filter, exit.opacity, exit.rotateX]
  );

  return (
    <m.div
      className={cn(
        "relative w-full overflow-hidden",
        className
      )}
      style={
        webgl
          ? {
              perspective: "5cm",
            }
          : {}
      }
      {...others}
    >
      <AnimatePresence
        mode={webgl ? "sync" : "wait"}
        initial={false}
        custom={reverse}
      >
        <PresenceText key={text} custom={reverse}>
          <Text text={text} />
        </PresenceText>
      </AnimatePresence>
      <Text
        className="relative opacity-0"
        text={text}
      />
    </m.div>
  );
};
