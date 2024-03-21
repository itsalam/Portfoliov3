"use client";

import { TitleCard } from "@/components/Card";
import { AnimateText, RotateText } from "@/components/TextEffects";
import { cn } from "@/lib/utils";
import { Text } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { motion, useAnimationControls } from "framer-motion";
import { ComponentProps, useEffect, useRef } from "react";
import { CARD_TYPES } from "./types";

export default function HeroCard(props: ComponentProps<typeof TitleCard>) {
  const { className, ...rest } = props;
  const heroRef = useRef<HTMLDivElement>(null);

  const controls = useAnimationControls();

  useEffect(() => {
    setTimeout(() => {
      controls.start("animate").then(() => {
        setTimeout(() => {
          controls.start("rotate");
        }, 700);
      });
    }, 2000);
  }, [controls]);

  const animateTransition = {
    initial: {
      y: "100%",
      opacity: 0,
    },
    animate: {
      y: "0%",
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  const MText = motion(Text);

  const TextRotateBody = () => (
    <motion.div
      className="relative"
      key="intro"
    >
      <MText size={"7"} className="relative flex pb-4 top-1">
        <AnimateText
          size={"4"}
          className="whitespace-nowrap "
          text="Hi there, I&lsquo;m"
          variants={animateTransition}
        />
        <span className="relative w-1"> </span>
        <RotateText
          size={"4"}
          className="relative top-[0px] text-inherit"
          range={[0, 2]}
          text="(a)"
        />
      </MText>
      <div className="flex flex-col gap-0 relative h-g-y-1 my-gap-y pr-0 font-bold ">
        <div className="absolute h-full top-0 flex flex-row gap-0">
          <RotateText
            size={"9"}
            className="absolute"
            range={[2, 0]}
            text="Vincent Lam"
            variants={animateTransition}
          />
          <RotateText
            size={"9"}
            className="relative top-0 left-0 h-full"
            range={[0, 1]}
            text="Full-Stack"
          />
          <RotateText
            size={"9"}
            className="absolute top-0 left-0"
            range={[1, 2]}
            text="Front-End"
          />
          <span className="relative w-4"> </span>
          <RotateText
            size={"9"}
            className="relative font-bold"
            range={[0, 2]}
            text="Dev"
          />
        </div>
      </div>
    </motion.div>
  );

  return (
    <TitleCard
      containerClassName={cn(
        "flex-col w-g-x-6 3xl:w-g-x-4 max-h-g-y-4-4/8",
        className
      )}
      className={cn("flex-col flex relative mx-g-x-2/8 my-auto justify-end")}
      title={CARD_TYPES.Home}
      animate={controls}
      ref={heroRef}
      initial="initial"
      id={CARD_TYPES.Home}
      key={CARD_TYPES.Home}
      {...rest}
    >
      <TextRotateBody />
      <Text asChild key="body" size={"3"} className="z-30 min-w-g-x-3 py-4">
        <span>
          I build services for businesses professionally and enjoy creating web
          projects in my free time. I&apos;m keen on JavaScript, web design, and
          AI.
        </span>
      </Text>
      {/* <Text key="techlist" size={"2"} className="font-favorit py-4 z-30">
        Stuff I use:
      </Text> */}
    </TitleCard>
  );
}
