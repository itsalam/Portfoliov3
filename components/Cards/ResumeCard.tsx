"use client";

import { TitleCard } from "@/components/Card";
import { CMSContext } from "@/lib/state";
import { cn } from "@/lib/utils";
import "@radix-ui/themes/styles.css";
import { motion, useAnimate } from "framer-motion";
import { ComponentProps, useContext, useRef } from "react";
import { useStore } from "zustand";
import { CARD_TYPES } from "./types";

export default function ResumeCard(props: ComponentProps<typeof motion.div>) {
  const { className, ...rest } = props;
  const [cardRef] = useAnimate();
  const containerRef = useRef<HTMLDivElement>(null);
  const cms = useContext(CMSContext)!;
  const resume = useStore(cms, (cms) => cms.resume);

  return (
    <TitleCard
      {...rest}
      containerClassName={cn(className)}
      className={cn("relative flex h-full flex-col")}
      title={CARD_TYPES.Resume}
      ref={cardRef}
      initial="initial"
      id={CARD_TYPES.Resume}
      key={CARD_TYPES.Resume}
    >
      {resume && (
        <iframe title={resume?.title} src={resume?.url} height="100%"></iframe>
      )}
    </TitleCard>
  );
}
