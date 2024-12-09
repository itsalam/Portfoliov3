"use client";

import { HeroText, MotionText } from "@/components/motion/TextEffects";
import { useWebGLSupport } from "@/lib/hooks";
import { GridContext } from "@/lib/providers/clientState";
import { cn } from "@/lib/utils";
import { Text as BaseText } from "@radix-ui/themes";
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

const Text = m(BaseText);

const animateTransition = {
  initial: {
    y: 20,
    opacity: 0,
    filter: "blur(5px)",
  },
  show: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      // duration: 0.6,
      when: "beforeChildren",
      transition: { delayChildren: 4 },
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
    console.log(activeCard);
    if (activeCard !== CARD_TYPES.Home) {
      controls.start("stop");
    } else {
      controls.start("show").then(() => {
        if (webgl) {
          timeout = setTimeout(() => {
            controls.start("rotate");
          }, 2000);
        }
      });
    }
    return () => timeout && clearTimeout(timeout);
  }, [activeCard, controls, webgl]);

  const TextRotateBody = useCallback(
    () => (
      <m.div
        animate={controls}
        className="relative flex flex-col gap-1"
        key="intro"
        initial="initial"
        variants={{
          initial: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              when: "beforeChildren",
              staggerChildren: 0.5,
            },
          },
        }}
      >
        <Text
          size={"7"}
          className="relative top-1 mb-1 flex overflow-hidden"
          style={{ perspective: "30cm" }}
          variants={animateTransition}
          // initial="initial"
          // animate="show"
          onAnimationComplete={(e) => console.log(e)}
        >
          <MotionText
            splitText
            size={"4"}
            className="w-min whitespace-nowrap"
            text="Hi there, I&lsquo;m"
            variants={animateTransition}
            onAnimationComplete={(e) => console.log(e)}
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
        <m.div
          className={cn(
            "my-gap-y",
            "relative flex flex-col gap-0", // basicStyles, sizing, layout
            "overflow-hidden pr-0 font-bold" // overflowControl, padding, textStyles
          )}
          style={{ perspective: "2cm" }}
          // initial="initial"
          // animate="show"
          variants={animateTransition}
        >
          {/* <div className="absolute top-0 flex h-full flex-row gap-0"> */}
          <m.div
            className="xs:flex-row absolute flex flex-col flex-wrap gap-x-4"
            variants={animateTransition}
          >
            <m.div className="relative overflow-hidden">
              <HeroText
                size={"9"}
                className="relative top-0 left-0 flex h-16 items-center"
                range={[2, 0]}
                text="Vincent Lam"
                onAnimationComplete={(e) => console.log(e)}
              />
            </m.div>
          </m.div>

          <m.div
            className={"xs:flex-row relative flex flex-col flex-wrap gap-x-4"}
          >
            <m.div className="relative overflow-hidden">
              <HeroText
                size={"9"}
                className="relative top-0 left-0 flex h-16 items-center"
                range={[0, 1]}
                text="Full-Stack"
              />
            </m.div>

            <m.div className="relative overflow-hidden">
              <HeroText
                size={"9"}
                className="relative flex h-16 items-center font-bold"
                range={[0, 2]}
                text="Dev"
              />
            </m.div>
          </m.div>

          <m.div className="absolute h-16 w-full overflow-hidden">
            <HeroText
              size={"9"}
              className="absolute top-0 left-0 flex h-16 items-start"
              range={[1, 2]}
              text="Front-End"
            />
          </m.div>
          <span className="relative w-4">
            {" "}
          </span>
        </m.div>
        <MotionText
          key="body"
          size={{ initial: "2", md: "3" }}
          className="z-30 w-full max-w-[550px] text-balance pb-4"
          variants={animateTransition}
          text={
            "I build services for businesses professionally and enjoy creating web projects in my free time. I'm keen on JavaScript, web design, and AI."
          }
        />
      </m.div>
    ),
    [controls]
  );

  return (
    <m.div
      className={cn(
        "xs:p-0",
        "relative mx-g-1/8 flex h-full", // basicStyles, margin, sizing
        "flex-col justify-end overflow-hidden" // layout, overflowControl
      )}
      ref={heroRef}
      // animate={{
      //   width: ["0%", "100%"],
      //   filter: ["blur(1rem)", "blur(0rem)"],
      //   transition: {
      //     duration: 2,
      //   },
      // }}
      onAnimationComplete={(e) => console.log(e)}
      {...props}
    >
      <m.div
        className={cn(
          "relative", // basicStyles
          "flex h-full max-h-[350px] min-w-[--card-width]", // sizing
          "flex-col justify-center px-6" // layout, padding
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
