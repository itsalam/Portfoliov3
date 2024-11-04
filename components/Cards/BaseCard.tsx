"use client";

import { useBreakpoints } from "@/lib/providers/breakpoint";
import { cn } from "@/lib/utils";
import { Separator, Text } from "@radix-ui/themes";
import { Variants, m } from "framer-motion";
import { LucideIcon } from "lucide-react";
import {
  CSSProperties,
  ComponentProps,
  FC,
  MouseEventHandler,
  ReactNode,
} from "react";
import { Button } from "../Buttons/Button";

type ButtonArgs = {
  Icon: LucideIcon;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

const BaseCard: FC<
  ComponentProps<typeof m.div> & {
    title?: string | ReactNode;
    buttons?: ButtonArgs[];
  }
> = ({ className, children, title, buttons, ...rest }) => {
  const breakpoint = useBreakpoints();
  const isSmall = breakpoint === "xs" || breakpoint === "sm";
  return (
    <m.div
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      className={cn(
        "card group/card border-[1px]",
        "flex origin-top-left flex-col", // sizing, transforms, layout
        "overflow-hidden", // overflowControl
        "border-[--accent-a3] hover:border-[--accent-10] dark:hover:border-[--accent-a7]", // border
        className
      )}
      initial={{ originX: 0, originY: 0 }}
      {...rest}
    >
      <m.div
        draggable={false}
        className={cn(
          "glass",
          "relative z-10 flex", // basicStyles, layoutControl, sizing
          "flex-col justify-center", // layout
          "group-hover/card:dark:bg-[--accent-a3]", // background
          "group-hover/card:bg-[--accent-a7] bg-[--gray-surface]",
          "font-light group-hover/card:text-[--gray-contrast]", // textStyles
          "group-hover/card:dark:text-[--accent-11]",
          "opacity-100 transition-opacity", // transparency, transitionsAnimations
          isSmall ? "h-12" : "h-8"
        )}
        variants={{
          expand: {
            opacity: [null, 0],
            height: [null, 0],
          },
          minimize: {
            opacity: [null, 1],
            height: [null, "32px"],
          },
        }}
      >
        <Text
          size={isSmall ? "4" : "2"}
          className={cn(
            "color-[--gray-a4] user-select-none select-none",
            "pointer-events-none w-fit", // basicStyles, sizing
            "text-ellipsis text-nowrap py-1 px-3", // textWrapping, padding
            "transition-colors" // transitionsAnimations
          )}
          style={{ ["--letter-spacing"]: "0.02em" } as CSSProperties}
        >
          {title}
        </Text>
        <Separator
          className={cn(
            "absolute", // basicStyles
            "bottom-0 left-0 w-full", // positioning, sizing
            "bg-[--gray-a3] group-hover/card:bg-[--gray-10]", // background
            "group-hover/card:dark:bg-[--gray-a7]",
            "transition-all" // transitionsAnimations
          )}
          size="4"
        />

        <div className="absolute right-1 z-50 flex h-5 gap-1">
          {buttons?.map(({ Icon, ...props }, index) => (
            <Button {...props} key={`${title}-button-${index}`}>
              <Icon size={10} />
            </Button>
          ))}
        </div>
      </m.div>
      <m.div
        className={cn(
          "card-bg z-30 h-full overflow-hidden transition-colors"
        )}
        variants={
          {
            expand: {
              "--backdrop-opacity": [null, 0.0],
              opacity: [null, 1],
              overflow: "visible",
            },
            minimize: {
              "--backdrop-opacity": [null, 1.0],
              opacity: [null, 1],
              overflow: "hidden",
            },
            animate: {
              opacity: [null, 1],
              transition: {
                type: "just",
              },
            },
            focused: {
              opacity: 1,
            },
            open: {
              opacity: [0, 1],
              transition: {
                duration: 0.5,
                delay: 1.25,
              },
            },
          } as Variants
        }
      >
        {children}
      </m.div>
    </m.div>
  );
};

export default BaseCard;
