"use client";

import { TitleCard } from "@/components/Card";
import { useScrollNavigation } from "@/lib/clientUtils";
import { cn } from "@/lib/utils";
import { ScrollArea, Separator, Text } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { motion, useAnimate } from "framer-motion";
import { LoremIpsum } from "lorem-ipsum";
import { ComponentProps } from "react";

const lorem = new LoremIpsum();

type Experience = {
  companyName: string;
  tenures: {
    title: string;
    from: string;
    to: string;
    descriptions: string[];
    location?: string;
  }[];
};
[];

const Experiences: Experience[] = Array.from({ length: 4 }).map((_, i) => ({
  companyName: `Work ${i + 1}`,
  tenures: Array.from({ length: 2 }).map((_, j) => ({
    location: "Toronto, ON",
    title: `Title ${j + 1}`,
    from: new Date().getFullYear().toString(),
    to: new Date().getFullYear().toString(),
    descriptions: Array.from({ length: 3 }).map(() =>
      lorem.generateSentences(2)
    ),
  })),
}));

export default function ExperienceCard(
  props: ComponentProps<typeof motion.div>
) {
  const { className, ...rest } = props;
  const [projectsRef] = useAnimate();
  const { controls } = useScrollNavigation(projectsRef, true);

  return (
    <TitleCard
      {...rest}
      containerClassName={className}
      className={cn("flex-col flex relative w-g-x-4 h-g-y-4 p-4 py-g-y-0.25")}
      title="Experience"
      animate={controls}
      ref={projectsRef}
      initial="initial"
      id="experience"
      key={"experience"}
    >
      <ScrollArea type="always" scrollbars="vertical">
        {Experiences.map((experience, i) => (
          <div key={i} className="flex flex-col gap-y-2 mr-4 pb-6">
            <Text size="3" className="font-bold">
              {experience.companyName}
            </Text>
            {experience.tenures.map((tenure, j) => (
              <>
                <Separator
                  size="4"
                  className={cn({
                    "opacity-25": j !== 0,
                    "opacity-100": j === 0,
                  })}
                />
                <div key={j} className="flex flex-col gap-1">
                  <span className="flex gap-1 items-baseline">
                    <Text size="2" className="font-bold">
                      {tenure.title}
                    </Text>
                    <Text size="1" className="font-bold text-[--sage-11]">
                      {"// "}
                      {tenure.location}
                    </Text>
                  </span>
                  <span className="text-xs">
                    {tenure.from} - {tenure.to}
                  </span>
                  <ul className="list-disc pl-4">
                    {tenure.descriptions.map((description, k) => (
                      <li key={k} className="text-xs text-[--sage-11]">
                        {description}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ))}
          </div>
        ))}
      </ScrollArea>
    </TitleCard>
  );
}
