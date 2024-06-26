"use client";

import { AnimateText, RotateText } from "@/components/motion/TextEffects";
import { cn } from "@/lib/utils";
import { Text } from "@radix-ui/themes";
import { motion, useAnimationControls } from "framer-motion";
import { ComponentProps, useCallback, useEffect, useRef } from "react";

const MText = motion(Text);

const animateTransition = {
  initial: {
    y: "100%",
    opacity: 0,
  },
  show: {
    y: "0%",
    opacity: 1,
    transition: {
      duration: 0.6,
    },
  },
};

export default function HeroCard(props: ComponentProps<typeof motion.div>) {
  const heroRef = useRef<HTMLDivElement>(null);

  const controls = useAnimationControls();

  useEffect(() => {
    const timeout = setTimeout(() => {
      controls.start("show").then(() => {
        setTimeout(() => {
          controls.start("rotate");
        }, 700);
      });
    }, 200);
    return () => clearTimeout(timeout);
  }, [controls]);

  const TextRotateBody = useCallback(
    () => (
      <motion.div
        animate={controls}
        className="relative flex flex-col gap-1 py-8"
        key="intro"
      >
        <MText size={"7"} className="relative top-1 mb-1 flex overflow-hidden">
          <AnimateText
            size={"4"}
            className="w-min whitespace-nowrap"
            text="Hi there, I&lsquo;m"
            variants={animateTransition}
          />
          <span className="relative w-1"> </span>
          <RotateText
            size={"4"}
            className="relative top-0 text-inherit"
            range={[0, 2]}
            text="(a)"
          />
        </MText>
        <div
          className={cn(
            "my-gap-y",
            "relative flex flex-col gap-0", // basicStyles, sizing, layout
            "overflow-hidden pr-0 font-bold" // overflowControl, padding, textStyles
          )}
        >
          {/* <div className="absolute top-0 flex h-full flex-row gap-0"> */}
          <div className="absolute flex flex-col flex-wrap gap-x-4 xs:flex-row">
            <div className="relative overflow-hidden">
              <RotateText
                size={"9"}
                className="relative left-0 top-0 flex h-16 items-center"
                range={[2, 0]}
                text="Vincent"
                variants={animateTransition}
              />
            </div>
            <div className="relative overflow-hidden">
              <RotateText
                size={"9"}
                className="relative flex h-16 items-center"
                range={[2, 0]}
                text="Lam"
                variants={animateTransition}
              />
            </div>
          </div>

          <div
            className={"relative flex flex-col flex-wrap gap-x-4 xs:flex-row"}
          >
            <div className="relative overflow-hidden">
              <RotateText
                size={"9"}
                className="relative left-0 top-0 flex h-16 items-center"
                range={[0, 1]}
                text="Full-Stack"
              />
            </div>

            <div className="relative overflow-hidden">
              <RotateText
                size={"9"}
                className="relative flex h-16 items-center font-bold"
                range={[0, 2]}
                text="Dev"
              />
            </div>
          </div>

          <div className="absolute h-16 w-full overflow-hidden">
            <RotateText
              size={"9"}
              className="absolute left-0 top-0 flex h-16 items-start"
              range={[1, 2]}
              text="Front-End"
            />
          </div>
          <span className="relative w-4"> </span>
          {/* </div> */}
        </div>
        <Text
          asChild
          key="body"
          size={"3"}
          className="z-30 min-w-g-3 max-w-g-5 py-0"
        >
          <span>
            I build services for businesses professionally and enjoy creating
            web projects in my free time. I&apos;m keen on JavaScript, web
            design, and AI.
          </span>
        </Text>
      </motion.div>
    ),
    [controls]
  );

  return (
    <motion.div
      className={cn(
        "xs:p-0",
        "relative mx-g-2/8 flex h-full",
        "flex-col justify-end p-4" // basicStyles, margin, sizing // layout, padding
      )}
      ref={heroRef}
      {...props}
    >
      <TextRotateBody />
    </motion.div>
  );
}
