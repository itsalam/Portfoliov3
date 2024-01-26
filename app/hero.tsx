"use client";

import { Text } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { Variant, motion, useAnimation } from "framer-motion";
import React, { useEffect } from "react";

const RotateText: React.FC<
  React.ComponentProps<typeof motion.div> & {
    distance?: number;
    range?: [number, number];
    length?: number;
    variant?: Variant;
    text: string;
  } & Pick<React.ComponentProps<typeof Text>, "size">
> = (props) => {
  const {
    distance = 145,
    range = [0, 1],
    length = 3,
    className,
    variant,
    text,
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

  const opacity = y.map((val) => (val === "0%" ? 1 : 0));
  return (
    <motion.div
      className={`absolute flex w-min whitespace-nowrap overflow-y-hidden ${className}`}
      variants={{
        rotate: {
          ...variant,
          transition: {
            duration: 8,
            ease: "easeInOut",
            times: [0.4, 0.5, 0.65, 0.75, 0.9, 1],
            repeat: Infinity,
            repeatDelay: 0.5,
            staggerChildren: 0.05,
          },
        },
      }}
    >
      {(text as string).split("").map((child, i) => (
        <motion.p
          key={`${text}-${i}`}
          className="relative origin-[50%_50%_4rem] my-auto whitespace-pre"
          variants={{
            initial: {
              opacity: opacity[0],
            },
            rotate: {
              y: y,
              opacity,
              transition: {
                duration: 8,
                ease: "easeInOut",
                times: [0.4, 0.5, 0.65, 0.75, 0.9, 1],
                repeat: Infinity,
                repeatDelay: 0.5,
                staggerChildren: 0.025,
              },
            },
          }}
        >
          {child}
        </motion.p>
      ))}
    </motion.div>
  );
};

export default function Hero() {
  const controls = useAnimation();

  useEffect(() => {
    controls.start("rotate");
  }, [controls]);

  const TextRotateBody = () => (
    <>
      <div className="flex flex-col gap-0 relative h-[calc(100% - var(--y-padding)*2)] pr-0 ">
        <RotateText className="font-bold" range={[2, 0]} text="Vincent" />
        <motion.div
          className="relative flex"
          transition={{
            staggerChildren: 6.5,
          }}
        >
          <RotateText
            className="relative font-bold"
            range={[0, 1]}
            text="Full-Stack"
          />
        </motion.div>
        <RotateText className="font-bold" range={[1, 2]} text="Front-End" />
      </div>
      <div className="flex flex-col gap-0 relative ml-g-x-1 p-gap pr-0 pt-0 pb-0">
        <RotateText className="font-bold" range={[2, 0]} text="Lam" />
        <RotateText className="relative font-bold" range={[0, 2]} text="Dev" />
      </div>
    </>
  );

  return (
    <motion.div
      animate={controls}
      initial="initial"
      id="hero"
      className="ml-g-x-1/2 mt-g-y-1/2 pt-g-y-4 pl-g-x-4 h-auto flex font-display text-grid relative"
    >
      <div className="flex-col flex relative py-0 ">
        <Text
          size={"7"}
          className="absolute flex -translate-y-full p-gap pl-g-x-1/2 pb-0 top-1"
        >
          <p className="whitespace-nowrap ">Hi there, I&lsquo;m</p>
          <span className="relative w-2"> </span>
          {/* <Text className="relative top-[0px]" size={"8"}>
            (a)
          </Text> */}
          <RotateText
            className="relative top-[0px] text-inherit"
            range={[0, 2]}
            text="(a)"
          />
        </Text>
        <TextRotateBody />
        {/* <p className="font-bold -ml-g-x-1/2">Vincent</p>
        <p className="font-bold ml-g-x-1">Lam</p> */}
      </div>
    </motion.div>
  );
}
