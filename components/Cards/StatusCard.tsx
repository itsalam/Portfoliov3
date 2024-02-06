"use client";

import { TitleCard } from "@/components/Card";
import { useScrollNavigation } from "@/lib/clientUtils";
import { cn } from "@/lib/utils";
import "@radix-ui/themes/styles.css";
import { motion, useAnimate } from "framer-motion";
import { ComponentProps } from "react";

export default function StatusCard(props: ComponentProps<typeof motion.div>) {
  const { className, ...rest } = props;
  const [projectsRef] = useAnimate();
  const { controls } = useScrollNavigation(projectsRef, true);

  return (
    <TitleCard
      {...rest}
      containerClassName={className}
      className={cn("flex relative w-g-x-2 h-g-y-2 gap-4")}
      title="Status"
      animate={controls}
      ref={projectsRef}
      initial="initial"
      id="status"
      key={"status"}
    >
      Available for full time.
    </TitleCard>
  );
}
