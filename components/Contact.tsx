"use client";

import { CMSContext } from "@/lib/providers/state";
import { cn } from "@/lib/utils";
import { Text as BaseText } from "@radix-ui/themes";
import {
  m,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUpRight as ArrowUpRightBase } from "lucide-react";
import React, {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  useContext,
  useRef,
  useState,
} from "react";
import { useStore } from "zustand";

const Text = m(BaseText);
const ArrowUpRight = m(ArrowUpRightBase);

const Link = forwardRef<
  ElementRef<typeof m.div>,
  ComponentPropsWithoutRef<typeof m.div> & {
    text: string;
    value?: string;
    mouseX: MotionValue;
  }
>((props) => {
  const { text, value, onHoverStart, mouseX, ...rest } = props;
  const [isHovered, setIsHovered] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };

    return val - bounds.x - bounds.width / 2;
  });

  const scaleTransform = useTransform(
    distance,
    [-31, -30, 0, 30, 31],
    [1.0, 1.1, 1.15, 1.1, 1.0]
  );

  const scale = useSpring(scaleTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  return (
    <m.div
      style={{ scale }}
      ref={ref}
      initial="initial"
      onHoverStart={(e, i) => {
        setIsHovered(true);
        onHoverStart?.(e, i);
      }}
      onHoverEnd={() => setIsHovered(false)}
      className="group flex flex-col gap-y-1"
      animate={isHovered ? "hovered" : undefined}
      variants={{
        hovered: {
          scale: [null, 1.1],
          transition: {
            delay: 0.1,
            duration: 0.2,
          },
        },
      }}
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
              animate={isHovered ? "hover" : "initial"}
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
      </a>
    </m.div>
  );
});

Link.displayName = "Link";

const ContactOverlay: React.FC = (props: ComponentPropsWithoutRef<"div">) => {
  const { className, ...rest } = props;
  const cms = useContext(CMSContext)!;
  const contacts = useStore(cms, (cms) => cms.contact);
  const mouseX = useMotionValue(Infinity);
  return (
    <div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "glass md:flex",
        "absolute bottom-g-1/8 left-g-1/8 z-50", // basicStyles, positioning, layoutControl
        "hidden items-center justify-center gap-2 rounded-lg", // sizing, layout, border
        "dark:bg-[--black-a10] bg-[--white-a10] p-2", // background, padding
        "text-[--accent-12]", // textStyles
        className
      )}
      {...rest}
    >
      {contacts &&
        contacts.map(({ name, link }) => (
          <Link key={name} text={name} value={link} mouseX={mouseX} />
        ))}
    </div>
  );
};

export default ContactOverlay;
