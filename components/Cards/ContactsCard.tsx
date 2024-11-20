"use client";

import Link from "@/components/Link";
import { CMSContext } from "@/lib/providers/state";
import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  CustomDomComponent,
  m,
  useAnimate,
} from "framer-motion";
import {
  Mail as EmailIcon,
  Github as GithubIcon,
  Linkedin as LinkedinIcon,
  LucideProps,
  MessageCircleQuestion as MessageCircleQuestionIcon,
} from "lucide-react";
import { ComponentProps, useContext, useState } from "react";
import { useStore } from "zustand";

const email = m(EmailIcon);
const github = m(GithubIcon);
const linkedin = m(LinkedinIcon);
const defaultIcon = m(MessageCircleQuestionIcon);

//Add a contact form, linkedin, github, resume, and email/phone section
const CONTACTS: Record<string, CustomDomComponent<LucideProps>> = {
  linkedin,
  github,
  email,
};

export default function ContactCard(props: ComponentProps<typeof m.div>) {
  const { className, ...rest } = props;
  const [projectsRef] = useAnimate();
  const [hoveredLink, setHoveredInfo] = useState<number>();
  const cms = useContext(CMSContext)!;
  const contacts = useStore(cms, (cms) => cms.contact);
  const Icon =
    contacts && hoveredLink
      ? CONTACTS[contacts[hoveredLink].name.toLowerCase()]
      : defaultIcon;

  return (
    <m.div
      {...rest}
      className={cn(
        "relative flex h-full flex-1 items-center gap-3 p-3",
        className
      )}
      ref={projectsRef}
      onMouseLeave={() => setHoveredInfo(undefined)}
    >
      <m.div
        className={"flex h-full w-full flex-1 justify-center rounded-full p-2"}
      >
        <m.div
          className={cn(
            "relative", // basicStyles
            "aspect-square max-h-full max-w-full overflow-hidden", // sizing, overflowControl
            "rounded-full bg-[--gray-a5]" // border, background
          )}
          variants={{}}
        >
          <AnimatePresence mode="wait">
            <Icon
              className={cn(
                "absolute", // basicStyles
                "top-0 left-0 h-full w-full p-4", // positioning, sizing, padding
                "text-[--accent-9]" // textStyles
              )}
              key={hoveredLink}
              initial={{
                opacity: 1,
              }}
              strokeDasharray={100}
              strokeDashoffset={100}
              animate={{
                strokeDashoffset: [100, 0],
                opacity: [null, 1],
              }}
              exit={{
                strokeDashoffset: [0, 100],
                opacity: [null, 0],
              }}
              transition={{
                strokeDashoffset: {
                  type: "tween",
                  duration: 0.15,
                },
                opacity: {
                  type: "tween",
                  duration: 0.2,
                },
              }}
            />
          </AnimatePresence>
        </m.div>
      </m.div>

      <div className="relative flex flex-1 flex-col justify-center gap-2">
        {contacts &&
          contacts.map(({ name, link }, i) => (
            <Link
              key={name}
              text={name}
              value={link}
              onHoverStart={() => {
                setHoveredInfo(i);
              }}
            />
          ))}
      </div>
    </m.div>
  );
}
