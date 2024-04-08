"use client";

import { AnimateText, RotateText } from "@/components/TextEffects";
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
  const { ...rest } = props;
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
      <motion.div className="relative flex flex-col gap-1" key="intro">
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
        <div className="my-gap-y relative flex h-g-5/8 flex-col gap-0 overflow-hidden pr-0 font-bold">
          <div className="absolute top-0 flex h-full flex-row gap-0">
            <RotateText
              size={"9"}
              className="absolute flex h-full items-center"
              range={[2, 0]}
              text="Vincent Lam"
              variants={animateTransition}
            />
            <RotateText
              size={"9"}
              className="relative left-0 top-0 flex h-full items-center"
              range={[0, 1]}
              text="Full-Stack"
            />
            <RotateText
              size={"9"}
              className="absolute left-0 top-0 flex h-full items-center"
              range={[1, 2]}
              text="Front-End"
            />
            <span className="relative w-4"> </span>
            <RotateText
              size={"9"}
              className="relative flex items-center font-bold"
              range={[0, 2]}
              text="Dev"
            />
          </div>
        </div>
        <Text asChild key="body" size={"3"} className="min-w-g-3 z-30 py-0">
          <span>
            I build services for businesses professionally and enjoy creating
            web projects in my free time. I&apos;m keen on JavaScript, web
            design, and AI.
          </span>
        </Text>
      </motion.div>
    ),
    []
  );

  return (
    <motion.div
      className={cn("relative mx-g-2/8 flex h-full flex-col justify-center")}
      animate={controls}
      ref={heroRef}
      initial="initial"
    >
      <TextRotateBody />
    </motion.div>
  );
}
