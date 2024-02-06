"use client";

import ContactCard from "@/components/Cards/ContactsCard";
import ExperienceCard from "@/components/Cards/ExperienceCard";
import HeroCard from "@/components/Cards/HeroCard";
import LocationCard from "@/components/Cards/LocationCard";
import MenuCard from "@/components/Cards/MenuCard";
import ProjectsCard from "@/components/Cards/ProjectsCard";
import "@radix-ui/themes/styles.css";
import { motion } from "framer-motion";
import { useRef } from "react";

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={heroRef}
      className="h-full w-full items-start block relative flex-wrap gap-y-g-x-1/4"
    >
      <HeroCard className="left-g-x-1 top-g-y-4/8" dragConstraints={heroRef} />
      <ProjectsCard
        className="bottom-g-y-4/8 right-g-x-2"
        dragConstraints={heroRef}
      />
      <ExperienceCard
        className="top-g-y-4/8 right-g-x-2"
        dragConstraints={heroRef}
      />
      <ContactCard
        className="bottom-g-y-4/8 left-g-x-4-1/8"
        dragConstraints={heroRef}
      />
      <MenuCard
        className="right-g-x-4/8 top-g-y-1-2/8"
        dragConstraints={heroRef}
      />
      <LocationCard
        className="left-g-x-1 bottom-g-y-4/8"
        dragConstraints={heroRef}
      />
    </motion.div>
  );
}
