"use client";

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
  useState,
} from "react";

const Text = motion(BaseText);
const Separator = motion(BaseSeparator);
const ArrowUpRight = motion(ArrowUpRightBase);
const Email = motion(EmailIcon);
const Github = motion(GithubIcon);
const Linkedin = motion(LinkedinIcon);
const MessageCircleQuestion = motion(MessageCircleQuestionIcon);

//Add a contact form, linkedin, github, resume, and email/phone section
const CONTACTS: Record<
  string,
  { value: string; Icon: CustomDomComponent<LucideProps> }
> = {
  LinkedIn: {
    value: "https://www.linkedin.com/in/vincent-lam-1a2b3c4d/",
    Icon: Linkedin,
  },
  GitHub: { value: "github.com/vincentlam", Icon: Github },
  Email: { value: "vincentthanhlam@gmail.com", Icon: Email },
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
      className="group flex flex-col gap-y-1"
      animate={isHovered ? "hover" : "exit"}
      ref={ref}
      {...rest}
    >
      <a
        href={value}
        className=" relative w-min overflow-hidden"
        target="_blank"
        rel="noreferrer"
      >
        <Text
          size="2"
          className={cn(
            "flex items-center overflow-hidden text-[--gray-11] transition-colors duration-300 group-hover:text-[--accent-10]"
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
          className="bg-[--gray-11] transition-colors duration-300 group-hover:bg-[--accent-10]"
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
  const [hoveredLink, setHoveredLink] = useState<string>();
  const Icon = hoveredLink
    ? CONTACTS[hoveredLink]?.Icon
    : MessageCircleQuestion;

  return (
    <motion.div
      {...rest}
      className={cn(
        "relative flex h-full flex-1 items-center gap-3 p-3",
        className
      )}
      ref={projectsRef}
      onMouseLeave={() => setHoveredLink(undefined)}
    >
      <motion.div className="flex h-full w-full flex-1 justify-center rounded-full p-2">
        <motion.div
          className="bg-blur-xl relative aspect-square max-h-full max-w-full overflow-hidden rounded-full bg-[--gray-a5]"
          variants={{}}
        >
          <AnimatePresence mode="wait">
            <Icon
              className="absolute left-0 top-0 h-full w-full p-4 text-[--accent-9]"
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
        {Object.entries(CONTACTS).map(([key, { value }]) => (
          <Link
            key={key}
            text={key}
            value={value}
            onHoverStart={() => {
              setHoveredLink(key);
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
