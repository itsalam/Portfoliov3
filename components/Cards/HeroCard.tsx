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
  const { controls } = useScrollNavigation(heroRef, true, (controls) =>
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
    <motion.div className="relative" key="intro">
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
      <div className="flex flex-col gap-0 relative h-g-y-5/8 my-gap-y pr-0 font-bold ">
        <RotateText
          size={"9"}
          className="absolute"
          range={[2, 0]}
          text="Vincent Lam"
          variants={animateTransition}
        />
        <div className="absolute h-full top-0 flex flex-row gap-0">
          <RotateText
            size={"9"}
            className="relative top-0 left-0"
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
      {...rest}
      containerClassName={cn(
        "flex-col w-g-x-5-4/8 3xl:w-g-x-4 h-g-y-3 dra",
        className
      )}
      className={cn(
        "flex-col flex relative px-g-x-2/8 py-g-y-2/8 justify-end my-auto"
      )}
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
