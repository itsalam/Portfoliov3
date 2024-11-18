import { cn } from "@/lib/utils";
import { Text as BaseText } from "@radix-ui/themes";
import { m } from "framer-motion";
import { ArrowUpRight as ArrowUpRightBase } from "lucide-react";
import {
  ComponentPropsWithoutRef,
  ElementRef,
  forwardRef,
  useState,
} from "react";

const Text = m(BaseText);
const ArrowUpRight = m(ArrowUpRightBase);

const Link = forwardRef<
  ElementRef<typeof m.div>,
  ComponentPropsWithoutRef<typeof m.div> & {
    text: string;
    value?: string;
  }
>((props) => {
  const { text, value, onHoverStart, ...rest } = props;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <m.div
      initial="initial"
      onHoverStart={(e, i) => {
        setIsHovered(true);
        onHoverStart?.(e, i);
      }}
      onHoverEnd={() => setIsHovered(false)}
      className="group flex flex-col gap-y-1"
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

export default Link;
