"use client";

import { CMSContext } from "@/lib/state";
import { cn } from "@/lib/utils";
import { Separator as BaseSeparator, Text as BaseText } from "@radix-ui/themes";
import {
  AnimatePresence,
  CustomDomComponent,
  motion,
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

const Text = motion(BaseText);
const Separator = motion(BaseSeparator);
const ArrowUpRight = motion(ArrowUpRightBase);
const email = motion(EmailIcon);
const github = motion(GithubIcon);
const linkedin = motion(LinkedinIcon);
const defaultIcon = motion(MessageCircleQuestionIcon);

//Add a contact form, linkedin, github, resume, and email/phone section
const CONTACTS: Record<string, CustomDomComponent<LucideProps>> = {
  linkedin,
  github,
  email,
};

const Link = forwardRef<
  ElementRef<typeof motion.div>,
  ComponentPropsWithoutRef<typeof motion.div> & { text: string; value?: string }
>((props, ref) => {
  const { text, value, onHoverStart, ...rest } = props;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial="initial"
      onHoverStart={(e, i) => {
        onHoverStart?.(e, i);
        setIsHovered(true);
      }}
      onHoverEnd={() => setIsHovered(false)}
      className="group flex flex-col gap-y-1"
      animate={isHovered ? "hover" : "exit"}
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
    </motion.div>
  );
});

Link.displayName = "Link";

export default function ContactCard(props: ComponentProps<typeof motion.div>) {
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
    <motion.div
      {...rest}
      className={cn(
        "relative flex h-full flex-1 items-center gap-3 p-3",
        className
      )}
      ref={projectsRef}
      onMouseLeave={() => setHoveredInfo(undefined)}
    >
      <motion.div
        className={"flex h-full w-full flex-1 justify-center rounded-full p-2"}
      >
        <motion.div
          className={cn(
            "bg-blur-xl",
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
                "left-0 top-0 h-full w-full p-4", // positioning, sizing, padding
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
        </motion.div>
      </motion.div>

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
    </motion.div>
  );
}
