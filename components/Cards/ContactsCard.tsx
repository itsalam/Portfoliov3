"use client";

import { CMSContext } from "@/lib/providers/state";
import { cn } from "@/lib/utils";
import { Separator as BaseSeparator, Text as BaseText } from "@radix-ui/themes";
import {
  AnimatePresence,
  CustomDomComponent,
  m,
  useAnimate,
} from "framer-motion";
import {
  ArrowUpRight as ArrowUpRightBase,
  Mail as EmailIcon,
  Github as GithubIcon,
  Linkedin as LinkedinIcon,
  LucideProps,
  MessageCircleQuestion as MessageCircleQuestionIcon,
} from "lucide-react";
import {
  ComponentProps,
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  useContext,
  useState,
} from "react";
import { useStore } from "zustand";

const Text = m(BaseText);
const Separator = m(BaseSeparator);
const ArrowUpRight = m(ArrowUpRightBase);
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

const Link = forwardRef<
  ElementRef<typeof m.div>,
  ComponentPropsWithoutRef<typeof m.div> & { text: string; value?: string }
>((props, ref) => {
  const { text, value, onHoverStart, ...rest } = props;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <m.div
      initial="initial"
      onHoverStart={(e, i) => {
        onHoverStart?.(e, i);
      }}
      onHoverEnd={() => setIsHovered(false)}
      className="group flex flex-col gap-y-1"
      ref={ref}
      {...rest}
    >
      <a
        href={value}
        className="relative w-min overflow-hidden"
        target="_blank"
        rel="noreferrer"
      >
        <Text
          size="2"
          className={cn(
            "flex", // sizing
            "items-center overflow-hidden", // layout, overflowControl
            "text-[--gray-11] group-hover:text-[--accent-10]", // textStyles
            "transition-colors duration-300" // transitionsAnimations
          )}
        >
          {text}
          <div className="overflow-hidden">
            <ArrowUpRight
              size={16}
              variants={{
                hover: {
                  x: ["0%", "100%", "-100%", "0%"],
                  y: ["0%", "-100%", "100%", "0%"],
                  transition: {
                    times: [0, 0.5, 0.5, 1],
                    duration: 0.33,
                  },
                },
                initial: {
                  x: "0%",
                },
              }}
            />
          </div>
        </Text>
        <Separator
          size="3"
          variants={{
            initial: {
              width: "100%",
            },
            hover: {
              width: [null, "100%", "0%", "100%"],
              marginLeft: [null, "100%", "0%", "0%"],
              transition: {
                times: [0, 0.5, 0.5, 1],
                duration: 0.33,
              },
            },
            exit: {
              width: "100%",
            },
          }}
        />
      </a>
    </m.div>
  );
});

Link.displayName = "Link";

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
            "bg-blur-md",
            "relative aspect-square max-h-full max-w-full", // basicStyles, sizing
            "overflow-hidden rounded-full", // overflowControl, border
            "bg-[--gray-a5]" // background
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
                // strokeDasharray: [0, 100],
                strokeDashoffset: [100, 0],
                // y: [-20, 0],
                // rotate: [-30, 0],
                opacity: [null, 1],
              }}
              exit={{
                strokeDashoffset: [0, 100],
                // y: [0, 20],
                // rotate: [0, 30],
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
