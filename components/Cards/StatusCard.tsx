"use client";

import { TitleCard } from "@/components/Card";
import { cn } from "@/lib/utils";
import "@radix-ui/themes/styles.css";
import { motion, useAnimate } from "framer-motion";
import { ComponentProps } from "react";
import { CARD_TYPES } from "./types";

export default function StatusCard(props: ComponentProps<typeof motion.div>) {
  const { className, ...rest } = props;
  const [projectsRef] = useAnimate();

  return (
    <TitleCard
      {...rest}
      containerClassName={cn(className)}
      className={cn("flex relative gap-4")}
      title={CARD_TYPES.Status}
      ref={projectsRef}
      initial="initial"
      id={CARD_TYPES.Status}
      key={CARD_TYPES.Status}
    >
      Available for full time.
    </TitleCard>
  );
}
