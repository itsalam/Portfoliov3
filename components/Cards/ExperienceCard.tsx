"use client";

import { CMSContext } from "@/lib/state";
import { cn, formatDate } from "@/lib/utils";
import { Separator, Text } from "@radix-ui/themes";
import { motion, useAnimate } from "framer-motion";
import { ComponentProps, Fragment, useContext } from "react";
import { useStore } from "zustand";
import ScrollArea from "../ScrollArea";

export default function ExperienceCard(
  props: ComponentProps<typeof motion.div>
) {
  const [cardRef] = useAnimate();
  const cms = useContext(CMSContext)!;
  const experiences = useStore(cms, (cms) => cms.works ?? []);

  return (
    <motion.div
      {...props}
      className={cn("relative flex h-full flex-col")}
      ref={cardRef}
      initial="initial"
    >
      <ScrollArea
        type="always"
        scrollbars="vertical"
        className="flex flex-col gap-4 py-4 pl-4"
      >
        {experiences.map((experience, i) => (
          <div key={i} className="mr-4 flex flex-col gap-y-2 pb-6">
            <Text size="8" className="font-bold">
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
                  <span className="flex flex-wrap items-baseline gap-2">
                    <Text size="4" className="font-bold">
                      {tenure.title}
                    </Text>

                    <Text size="2" className="font-bold text-[--gray-10]">
                      {tenure.location}
                    </Text>
                  </span>
                  <span className="text-xs text-[--gray-10]">
                    {formatDate(tenure.from)} - {formatDate(tenure.to)}
                  </span>
                  <ul className="flex list-disc flex-col gap-1 pl-4 pt-1 leading-loose">
                    {tenure.descriptions.map(
                      (description: string, k: number) => (
                        <li key={k} className="text-sm text-[--gray-12]">
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
    </motion.div>
  );
}
