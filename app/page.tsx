"use client";

import Backdrop from "@/components/Backdrop";
import HeroCard from "@/components/Cards/HeroCard";
import MenuCard from "@/components/Cards/MenuCard";
import Overlay from "@/components/Overlay";
import { useWindowDimensions } from "@/lib/clientUtils";
import "@radix-ui/themes/styles.css";
import { motion } from "framer-motion";
import { useRef } from "react";

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  useWindowDimensions();

  return (
    <>
      <Overlay />
      <Backdrop />
      <motion.div
        ref={heroRef}
        className="h-full w-full items-start block relative flex-wrap gap-y-g-x-1/4"
      >
        <HeroCard
          className="left-g-x-4/8 bottom-g-y-4/8"
          dragConstraints={heroRef}
        />
        <MenuCard
          className="right-g-x-4/8 top-g-y-2-5/8"
          dragConstraints={heroRef}
        />
      </motion.div>
    </>
  );
}
