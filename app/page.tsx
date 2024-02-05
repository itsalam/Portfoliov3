"use client";

import ContactCard from "@/components/Cards/ContactsCard";
import ExperienceCard from "@/components/Cards/ExperienceCard";
import HeroCard from "@/components/Cards/HeroCard";
import ProjectsCard from "@/components/Cards/ProjectsCard";
import "@radix-ui/themes/styles.css";
import { motion } from "framer-motion";
import { useRef } from "react";

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={heroRef}
      className="h-full w-full items-start block relative flex-wrap gap-y-g-x-0.25"
    >
      <HeroCard className="left-g-x-1 top-g-y-0.5" dragConstraints={heroRef} />
      <ProjectsCard
        className="bottom-g-y-0.5 right-g-x-0.5"
        dragConstraints={heroRef}
      />
      <ExperienceCard
        className="top-g-y-0.5 right-g-x-0.5"
        dragConstraints={heroRef}
      />
      <ContactCard
        className="bottom-g-y-0.5 left-g-x-0.5"
        dragConstraints={heroRef}
      />
    </motion.div>
  );
}
