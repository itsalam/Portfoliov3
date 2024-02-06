"use client";

import { TitleCard } from "@/components/Card";
import { useScrollNavigation } from "@/lib/clientUtils";
import { cn } from "@/lib/utils";
import EmailSvg from "@/public/email.svg";
import GithubSvg from "@/public/github.svg";
import LinkedinSvg from "@/public/linkedin.svg";
import ResumeSvg from "@/public/resume.svg";
import { Separator as BaseSeparator, Text as BaseText } from "@radix-ui/themes";
import { AnimatePresence, motion, useAnimate } from "framer-motion";
import { ArrowUpRight as ArrowUpRightBase } from "lucide-react";
import BaseImage from "next/image";
import {
  ComponentProps,
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  useState,
} from "react";

const Image = motion(BaseImage);
const Text = motion(BaseText);
const Separator = motion(BaseSeparator);
const ArrowUpRight = motion(ArrowUpRightBase);

//Add a contact form, linkedin, github, resume, and email/phone section
const CONTACTS: Record<string, { value: string; iconSrc: string }> = {
  LinkedIn: {
    value: "https://www.linkedin.com/in/vincent-lam-1a2b3c4d/",
    iconSrc: LinkedinSvg,
  },
  GitHub: { value: "github.com/vincentlam", iconSrc: GithubSvg },
  Resume: { value: "vincentlam.github.io/resume", iconSrc: ResumeSvg },
  Email: { value: "vincentthanhlam@gmail.com", iconSrc: EmailSvg },
};

const Link = forwardRef<
  ElementRef<typeof motion.div>,
  ComponentPropsWithoutRef<typeof motion.div> & { text: string; value: string }
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
      className="flex flex-col gap-y-1"
      animate={isHovered ? "hover" : "exit"}
      ref={ref}
      {...rest}
    >
      <a
        href={value}
        className="relative w-min"
        target="_blank"
        rel="noreferrer"
      >
        <Text
          size="2"
          className={cn(
            "flex items-center text-[--sage-11] hover:text-[--sage-12] transition-colors duration-300 overflow-hidden"
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
          className="bg-[--sage-11]"
          variants={{
            initial: {
              width: "0%",
            },
            hover: {
              width: "100%",
              marginLeft: "0%",
            },
            exit: {
              width: "0%",
              marginLeft: "100%",
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
  const { controls } = useScrollNavigation(projectsRef, true);
  const [hoveredLink, setHoveredLink] = useState<string>();

  return (
    <TitleCard
      {...rest}
      containerClassName={className}
      className={cn("flex relative w-g-x-2 h-g-y-2 p-3 gap-3")}
      title="Contact"
      animate={controls}
      ref={projectsRef}
      initial="initial"
      id="contact"
      key={"contact"}
    >
      <motion.div className="flex-1 rounded-full my-auto">
        <motion.div
          className="aspect-square relative rounded-full bg-[--gray-a5] bg-blur-xl"
          variants={{}}
        >
          <AnimatePresence>
            {hoveredLink && (
              <Image
                className="absolute top-0 left-0 w-full h-full p-4"
                src={CONTACTS[hoveredLink]?.iconSrc}
                alt="Follow us on Twitter"
                key={hoveredLink}
                priority
                initial={{
                  opacity: 1,
                }}
                animate={{
                  y: [-10, -10, 0],
                  rotate: [-90, -90, 0],
                  opacity: [0, 0, 1],
                  transition: {
                    duration: 0.266,
                  },
                }}
                exit={{
                  y: [-10, -10, -10],
                  rotate: [0, 90, 180],
                  opacity: [1, 0.5, 0],
                  transition: {
                    duration: 0.266,
                  },
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      <div className="flex flex-1 flex-col relative justify-center gap-2">
        {Object.entries(CONTACTS).map(([key, { value }], i) => (
          <Link
            key={i}
            text={key}
            value={value}
            onHoverStart={() => {
              setHoveredLink(key);
            }}
          />
        ))}
      </div>
    </TitleCard>
  );
}
