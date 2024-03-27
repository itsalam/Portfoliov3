"use client";

import { TitleCard } from "@/components/Card";
import { maskScrollArea } from "@/lib/clientUtils";
import { cn } from "@/lib/utils";
import { ScrollArea, Separator, Text } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { motion, useAnimate } from "framer-motion";
import { LoremIpsum } from "lorem-ipsum";
import { ComponentProps, Fragment, UIEvent, useEffect, useRef } from "react";
import { CARD_TYPES } from "./types";

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
  const [cardRef] = useAnimate();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: UIEvent) => {
    const h = e.target as HTMLElement;
    const st = h.scrollTop || document.body.scrollTop;
    const sh = h.scrollHeight || document.body.scrollHeight;
    const percent = st / (sh - h.clientHeight);
    maskScrollArea("bottom", containerRef.current as HTMLElement, percent, 10);
  };

  useEffect(() => {
    maskScrollArea("bottom", containerRef.current as HTMLElement, 0, 10);
  });

  return (
    <TitleCard
      {...rest}
      containerClassName={cn(className)}
      className={cn("flex-col flex relative p-4 h-full")}
      title={CARD_TYPES.Experience}
      ref={cardRef}
      initial="initial"
      id={CARD_TYPES.Experience}
      key={CARD_TYPES.Experience}
    >
      <ScrollArea
        onScroll={handleScroll}
        type="always"
        scrollbars="vertical"
        className="py-g-y-2/8"
        ref={containerRef}
      >
        {Experiences.map((experience, i) => (
          <div key={i} className="flex flex-col gap-y-2 mr-4 pb-6">
            <Text size="3" className="font-bold">
              {experience.companyName}
            </Text>
            {experience.tenures.map((tenure, j) => (
              <Fragment key={j}>
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
              </Fragment>
            ))}
          </div>
        ))}
      </ScrollArea>
    </TitleCard>
  );
}
