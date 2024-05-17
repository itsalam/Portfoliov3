"use client";

import { cn } from "@/lib/utils";
import { Text as RadixText } from "@radix-ui/themes";
import { AnimatePresence, Variants, motion } from "framer-motion";
import React, {
  ComponentProps,
  ComponentType,
  useCallback,
  useEffect,
  useState,
} from "react";

const MText = motion(RadixText);

type AnimateTextProps = {
  text: string;
  variants?: Variants;
  containerVariants?: Variants;
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
  const enter = [-1, 0];
  const leave = [0, 1];
  const hide = [-1, -1];
  const show = [0, 0];

  const y: string[] = Array(length)
    .fill(hide)
    .map((val, index) =>
      index === enterIdx ? enter : index === leaveIdx ? leave : val)
    .map((val, i) => (i > enterIdx && i < leaveIdx ? show : val))
    .flat(1)
    .map((val) => `${val * distance}%`);

  const opacity = y.map((val) => {
    const num = Number(val.match(/\d+/));
    return num === 0 ? 1 : num < 0 ? 0.3 : 0;
  });

  return (
    <AnimateText
      className="w-min"
      initial={{
        y: y[0],
        opacity: 1,
      }}
      variants={{
        rotate: {
          y: y,
          opacity,
          transition: {
            duration: 9,
            times: [0.4, 0.5, 0.65, 0.75, 0.9, 1],
            repeatDelay: 0.5,
            repeat: Infinity,
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

export const AnimatedText = (props: {
  className?: string;
  text: string;
  textChild: ComponentType<ComponentProps<typeof RadixText> & { text: string }>;
  reverse?: boolean;
}) => {
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
    (props: ComponentProps<typeof motion.div>) => (
      <motion.div
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
    <motion.div
      className={cn(
        "relative overflow-hidden",
        className
      )}
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
    </motion.div>
  );
};
