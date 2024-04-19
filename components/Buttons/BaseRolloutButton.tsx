import { cn } from "@/lib/utils";
import { Text as BaseText } from "@radix-ui/themes";
import { MotionProps, Variants, motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { ComponentProps, ComponentType, FC } from "react";

const Text = motion(BaseText);

export type BaseRolloutProps = {
  ComponentA: ComponentType<ComponentProps<LucideIcon> & MotionProps>;
  ComponentB: ComponentType<ComponentProps<LucideIcon> & MotionProps>;
  text: string;
  iconVariants?: Variants;
  iconSize?: ComponentProps<LucideIcon>["size"];
  textSize?: ComponentProps<typeof Text>["size"];
};

export const BaseRolloutButton: FC<
  ComponentProps<typeof motion.button> & BaseRolloutProps
> = (props) => {
  const {
    className,
    ComponentA,
    ComponentB,
    text,
    iconVariants,
    iconSize,
    textSize,
    ...buttonProps
  } = props;

  return (
    <motion.button
      whileHover="hover"
      className={cn(
        "flex items-center rounded-full border border-foreground bg-background",
        className
      )}
      {...buttonProps}
    >
      <motion.div
        className="relative aspect-square overflow-hidden p-0.5 "
        variants={{
          initial: {
            rotateZ: "-90deg",
          },
          hover: {
            rotateZ: "-180deg",
          },
          ...iconVariants,
        }}
      >
        <ComponentA
          className="relative aspect-square h-full p-1"
          initial={{
            opacity: 1,
          }}
          variants={{
            hover: {
              opacity: 0,
            },
          }}
          transition={{
            duration: 0.33,
          }}
          {...{ size: iconSize }}
        />
        <ComponentB
          className="absolute left-0.5 top-0.5 aspect-square p-1"
          initial={{
            opacity: 0,
          }}
          variants={{
            hover: {
              opacity: 1,
            },
          }}
          transition={{
            duration: 0.33,
          }}
          {...{ size: iconSize }}
        />
      </motion.div>

      <Text
        size={textSize || "2"}
        className="relative w-0 overflow-hidden whitespace-nowrap"
        variants={{
          initial: {
            width: "0%",
            paddingRight: "0px",
          },
          hover: {
            width: "auto",
            paddingRight: "10px",
            transition: {
              duration: 0.2,
              easing: "easeInOut",
            },
          },
        }}
      >
        {text}
      </Text>
    </motion.button>
  );
};
