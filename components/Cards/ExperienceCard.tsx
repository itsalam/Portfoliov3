"use client";

import { TitleCard } from "@/components/Card";
import { maskScrollArea } from "@/lib/clientUtils";
import { CMSContext } from "@/lib/state";
import { cn, formatDate } from "@/lib/utils";
import { ScrollArea, Separator, Text } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { motion, useAnimate } from "framer-motion";
import {
  ComponentProps,
  Fragment,
  UIEvent,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useStore } from "zustand";
import { CARD_TYPES } from "./types";

export default function ExperienceCard(
  props: ComponentProps<typeof motion.div>
) {
  const { className, ...rest } = props;
  const [cardRef] = useAnimate();
  const containerRef = useRef<HTMLDivElement>(null);
  const cms = useContext(CMSContext)!;
  const experiences = useStore(cms, (cms) => cms.works ?? []);

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
      className={cn("relative flex h-full flex-col")}
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
        className="py-4 pl-4"
        ref={containerRef}
      >
        {experiences.map((experience, i) => (
          <div key={i} className="mr-4 flex flex-col gap-y-2 pb-6">
            <Text size="6" className="font-bold">
              {experience.companyName}
            </Text>
            {experience.experiences.map((tenure, j) => (
              <Fragment key={j}>
                <Separator
                  size="4"
                  className={cn({
                    "opacity-25": j !== 0,
                    "opacity-100": j === 0,
                  })}
                />
                <div key={j} className="flex flex-col gap-1">
                  <span className="flex items-baseline gap-2">
                    <Text size="4" className="font-bold">
                      {tenure.title}
                    </Text>
                    <Text size="2" className="font-bold text-[--sage-11]">
                      {"  //  "}
                    </Text>
                    <Text size="2" className="font-bold text-[--sage-11]">
                      {tenure.location}
                    </Text>
                  </span>
                  <span className="text-xs">
                    {formatDate(tenure.from)} - {formatDate(tenure.to)}
                  </span>
                  <ul className="list-disc pl-4">
                    {tenure.descriptions.map(
                      (description: string, k: number) => (
                        <li key={k} className="text-xs text-[--sage-11]">
                          {description}
                        </li>
                      )
                    )}
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
