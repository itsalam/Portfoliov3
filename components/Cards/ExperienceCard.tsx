"use client";

import { useScrollMask } from "@/lib/hooks";
import { CMSContext } from "@/lib/providers/state";
import { cn, formatDate } from "@/lib/utils";
import { ScrollArea, Separator, Text } from "@radix-ui/themes";
import { m } from "framer-motion";
import { Fragment, useContext, useRef } from "react";
import { useStore } from "zustand";

const MScrollArea = m(ScrollArea);

export default function ExperienceCard() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const y = useScrollMask(scrollRef, "bottom", true);
  const cms = useContext(CMSContext)!;
  const experiences = useStore(cms, (cms) => cms.works ?? []);

  return (
    <div
      className={cn(
        "relative flex h-full flex-col"
      )}
    >
      <MScrollArea
        type="always"
        scrollbars="vertical"
        className="py-4 pl-4"
        ref={scrollRef}
        style={{ y }}
      >
        {experiences.map((experience, i) => (
          <div
            key={i}
            className="mr-4 flex flex-col gap-y-2 pb-12"
          >
            <Text
              size="8"
              className="font-bold"
            >
              {experience.companyName}
            </Text>
            {experience.experiences.map((tenure, j) => (
              <Fragment key={j}>
                <Separator
                  size="4"
                  className={cn(
                    {
                      "opacity-25": j !== 0,
                      "opacity-100": j === 0,
                    }
                  )}
                />
                <div
                  key={j}
                  className="flex flex-col gap-1"
                >
                  <span className="flex flex-wrap items-baseline gap-2">
                    <Text
                      size="4"
                      className="font-bold"
                    >
                      {tenure.title}
                    </Text>

                    <Text
                      size="2"
                      className="font-bold text-[--gray-10]"
                    >
                      {tenure.location}
                    </Text>
                  </span>
                  <span className="text-xs text-[--gray-10]">
                    {formatDate(tenure.from)} - {formatDate(tenure.to)}
                  </span>
                  <div
                    className={cn(
                      "flex", // sizing
                      "list-disc flex-col gap-1 pt-1 pl-4", // listStyles, layout, padding
                      "leading-loose" // textStyles
                    )}
                  >
                    {tenure.descriptions.map((
                      description: string,
                      k: number
                    ) => (
                      <div
                        key={k}
                        className="text-sm text-[--gray-12]"
                      >
                        {description}
                      </div>
                    ))}
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        ))}
      </MScrollArea>
    </div>
  );
}
