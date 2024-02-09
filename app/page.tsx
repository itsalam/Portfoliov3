"use client";

import Backdrop from "@/components/Backdrop";
import ContactCard from "@/components/Cards/ContactsCard";
import ExperienceCard from "@/components/Cards/ExperienceCard";
import HeroCard from "@/components/Cards/HeroCard";
import LocationCard from "@/components/Cards/LocationCard";
import MenuCard from "@/components/Cards/MenuCard";
import ProjectsCard from "@/components/Cards/ProjectsCard";
import Overlay from "@/components/Overlay";
import { useWindowDimensions } from "@/lib/clientUtils";
import { dimensionAtom, gridAtom } from "@/lib/state";
import "@radix-ui/themes/styles.css";
import { motion } from "framer-motion";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef } from "react";

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const setDimensions = useSetAtom(dimensionAtom);
  const grid = useAtomValue(gridAtom);
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    setDimensions({ width, height });
  }, [width, height, setDimensions]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--grid-width", `${grid.gridUnitWidth}px`);
    root.style.setProperty("--grid-height", `${grid.gridUnitHeight}px`);
    root.style.setProperty("--x-padding", `${grid.gapSize / 4}px`);
    root.style.setProperty("--y-padding", `${grid.gapSize / 4}px`);
  }, [grid]);

  return (
    <>
              <Overlay />
          <Backdrop />
              <motion.div
      ref={heroRef}
      className="h-full w-full items-start block relative flex-wrap gap-y-g-x-1/4"
    >
      <HeroCard className="left-g-x-4/8 top-g-y-4/8" dragConstraints={heroRef} />
      <ProjectsCard
        className="bottom-g-y-4/8 right-g-x-1-3/8"
        dragConstraints={heroRef}
      />
      <ExperienceCard
        className="top-g-y-4/8 right-g-x-1-3/8"
        dragConstraints={heroRef}
      />
      <ContactCard
        className="bottom-g-y-4/8 left-g-x-4-5/8"
        dragConstraints={heroRef}
      />
      <MenuCard
        className="right-g-x-4/8 top-g-y-2-5/8"
        dragConstraints={heroRef}
      />
      <LocationCard
        className="left-g-x-4/8 bottom-g-y-4/8"
        dragConstraints={heroRef}
      />
    </motion.div>
    </>
  );

}
