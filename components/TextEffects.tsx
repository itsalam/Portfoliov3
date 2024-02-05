import { cn } from "@/lib/utils";
import { Text } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { Variants, motion } from "framer-motion";
import React from "react";

const MText = motion(Text);

type AnimateTextProps = {
  text: string;
  variants?: Variants;
  containerVariants?: Variants;
};

const RotateText: React.FC<
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
      index === enterIdx ? enter : index === leaveIdx ? leave : val
    )
    .map((val, i) => (i > enterIdx && i < leaveIdx ? show : val))
    .flat(1)
    .map((val) => `${val * distance}%`);

  const opacity = y.map((val) => {
    const num = Number(val.match(/\d+/));
    return num === 0 ? 1 : num < 0 ? 0.3 : 0;
  });

  return (
    <AnimateText
      variants={{
        initial: {
          y: `${-distance}%`,
          opacity: 0,
        },
        rotate: {
          y: y,
          opacity,
          transition: {
            duration: 7,
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
  const { text, className, variants, containerVariants, ...textProps } = props;
  return (
    <motion.div
      key={text}
      className={cn(
        "flex w-min whitespace-nowrap overflow-y-hidden",
        className
      )}
      variants={{
        animate: {
          transition: {
            staggerChildren: 0.015,
          },
        },
        ...containerVariants,
      }}
    >
      {(text as string).split("").map((child, i) => (
        <MText
          key={`${text}-${i}-${child}`}
          className="relative origin-[50%_50%_4rem] my-auto whitespace-pre"
          variants={variants}
          {...textProps}
        >
          {child}
        </MText>
      ))}
    </motion.div>
  );
};

export { RotateText };
