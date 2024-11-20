"use client";

import { HeroText, MotionText } from "@/components/motion/TextEffects";
import { useWebGLSupport } from "@/lib/hooks";
import { GridContext } from "@/lib/providers/clientState";
import { cn } from "@/lib/utils";
import { Text } from "@radix-ui/themes";
import { m, useAnimationControls } from "framer-motion";
import {
  ComponentProps,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useStore } from "zustand";
import { BackButton } from "../Buttons/BackButton";
import { CARD_TYPES } from "./types";

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

export default function HeroCard(props: ComponentProps<typeof m.div>) {
  const heroRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const store = useContext(GridContext)!;
  const { toggleCard, activeCard, gridInfo } = useStore(store);
  const webgl = useWebGLSupport();

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (activeCard !== CARD_TYPES.Home) {
      controls.start("stop");
    } else {
      timeout = setTimeout(() => {
        controls.start("show").then(() => {
          if (!webgl) {
            return;
          }
          setTimeout(() => {
            controls.start("rotate");
          }, 700);
        });
      }, 0);
    }
    return () => timeout && clearTimeout(timeout);
  }, [activeCard, controls, webgl]);

  const TextRotateBody = useCallback(
    () => (
      <m.div
        animate={controls}
        className="relative flex flex-col gap-1"
        key="intro"
      >
        <Text
          size={"7"}
          className="relative top-1 mb-1 flex overflow-hidden"
          style={{ perspective: "30cm" }}
        >
          <MotionText
            size={"4"}
            className="w-min whitespace-nowrap"
            text="Hi there, I&lsquo;m"
            variants={animateTransition}
          />
          <span className="relative w-1">
            {" "}
          </span>
          <HeroText
            size={"4"}
            className="relative top-0 text-inherit"
            range={[0, 2]}
            text="(a)"
          />
        </Text>
        <div
          className={cn(
            "my-gap-y",
            "relative flex flex-col gap-0", // basicStyles, sizing, layout
            "overflow-hidden pr-0 font-bold" // overflowControl, padding, textStyles
          )}
          style={{ perspective: "2cm" }}
        >
          {/* <div className="absolute top-0 flex h-full flex-row gap-0"> */}
          <div className="xs:flex-row absolute flex flex-col flex-wrap gap-x-4">
            <div className="relative overflow-hidden">
              <HeroText
                size={"9"}
                className="relative top-0 left-0 flex h-16 items-center"
                range={[2, 0]}
                text="Vincent Lam"
                variants={animateTransition}
              />
            </div>
          </div>

          <div
            className={"xs:flex-row relative flex flex-col flex-wrap gap-x-4"}
          >
            <div className="relative overflow-hidden">
              <HeroText
                size={"9"}
                className="relative top-0 left-0 flex h-16 items-center"
                range={[0, 1]}
                text="Full-Stack"
              />
            </div>

            <div className="relative overflow-hidden">
              <HeroText
                size={"9"}
                className="relative flex h-16 items-center font-bold"
                range={[0, 2]}
                text="Dev"
              />
            </div>
          </div>

          <div className="absolute h-16 w-full overflow-hidden">
            <HeroText
              size={"9"}
              className="absolute top-0 left-0 flex h-16 items-start"
              range={[1, 2]}
              text="Front-End"
            />
          </div>
          <span className="relative w-4">
            {" "}
          </span>
          {/* </div> */}
        </div>
        <Text
          asChild
          key="body"
          size={{ initial: "2", md: "3" }}
          className="z-30 w-full max-w-[550px] pb-4"
        >
          <span>
            I build services for businesses professionally and enjoy creating
            web projects in my free time. I&apos;m keen on JavaScript, web
            design, and AI.
          </span>
        </Text>
      </m.div>
    ),
    [controls]
  );

  return (
    <m.div
      className={cn(
        "xs:p-0 relative mx-g-1/8 flex h-full flex-col justify-end"
      )}
      ref={heroRef}
      {...props}
    >
      <m.div
        className={cn(
          "relative", // basicStyles
          "flex h-full max-h-[350px] flex-col justify-center", // sizing, layout
          "px-2" // padding
        )}
      >
        <TextRotateBody />
        <BackButton
          initial={{ opacity: 0 }}
          animate={{
            opacity: !gridInfo.isMobile && activeCard ? [0, 1] : [null, 0],
            height: !gridInfo.isMobile && activeCard ? [0, 30] : [null, 0],
          }}
          className="w-fit overflow-hidden"
          onClick={() => toggleCard(null)}
        />
      </m.div>
    </m.div>
  );
}
