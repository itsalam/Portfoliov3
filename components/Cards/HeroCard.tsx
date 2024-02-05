"use client";

import { TitleCard } from "@/components/Card";
import { AnimateText, RotateText } from "@/components/TextEffects";
import { useScrollNavigation } from "@/lib/clientUtils";
import { cn } from "@/lib/utils";
import { Text } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { motion } from "framer-motion";
import { ComponentProps, useRef } from "react";

export default function HeroCard(props: ComponentProps<typeof motion.div>) {
  const { className, ...rest } = props;
  const heroRef = useRef<HTMLDivElement>(null);
  const { controls } = useScrollNavigation(heroRef, false, (controls) =>
    controls.start("rotate")
  );

  const animateTransition = {
    initial: {
      y: "50%",
      opacity: 0,
    },
    animate: {
      y: "0%",
      opacity: 1,
      transition: {
        duration: 0.4,
      },
    },
  };

  const MText = motion(Text);

  const TextRotateBody = () => (
    <motion.div className="relative">
      <MText size={"7"} className="relative flex pb-0 top-1">
        <AnimateText
          size={"2"}
          className="whitespace-nowrap "
          text="Hi there, I&lsquo;m"
          variants={animateTransition}
        />
        <span className="relative w-1"> </span>
        <RotateText
          size={"2"}
          className="relative top-[0px] text-inherit"
          range={[0, 2]}
          text="(a)"
        />
      </MText>
      <div className="flex flex-col gap-0 relative h-g-y-0.5 my-gapy pr-0 font-bold ">
        <RotateText
          size={"8"}
          className="absolute font-bold"
          range={[2, 0]}
          text="Vincent Lam"
          variants={animateTransition}
        />
        <div className="absolute h-full top-0 flex flex-row gap-0">
          <RotateText
            size={"8"}
            className="relative top-0 left-0"
            range={[0, 1]}
            text="Full-Stack"
          />
          <RotateText
            size={"8"}
            className="absolute top-0 left-0"
            range={[1, 2]}
            text="Front-End"
          />
          <span className="relative w-2"> </span>
          <RotateText
            size={"8"}
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
      {...rest}
      containerClassName={cn("flex-col", className)}
      className={cn("flex-col flex relative w-g-x-4 px-g-x-0.25 py-g-y-0.25")}
      title="Hero"
      animate={controls}
      ref={heroRef}
      initial="initial"
      id="hero"
      key={"hero"}
      variants={{
        initial: {
          opacity: 0,
        },
        animate: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 2,
          },
        },
        exit: {
          opacity: 0,
          y: "30%",
          transition: {
            duration: 0.33,
          },
        },
      }}
    >
      <TextRotateBody />
      <Text size={"2"}>
        I build services for businesses professionally and enjoy creating web
        projects in my free time. I&apos;m keen on JavaScript, web design, and
        AI.
      </Text>
      <Text size={"2"} className="font-favorit py-4">
        Stuff I use:
      </Text>
    </TitleCard>
  );
}
