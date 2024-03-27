import { cn } from "@/lib/utils";
import { Text as BaseText } from "@radix-ui/themes";
import { MotionProps, motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { ComponentProps, ComponentType, FC } from "react";

const Text = motion(BaseText);

export const BaseRolloutButton: FC<
  ComponentProps<typeof motion.button> & {
    ComponentA: ComponentType<ComponentProps<LucideIcon> & MotionProps>;
    ComponentB: ComponentType<ComponentProps<LucideIcon> & MotionProps>;
    text: string;
  }
> = (props) => {
  const { className, ComponentA, ComponentB, text, ...buttonProps } = props;

  return (
    <motion.button
      whileHover="hover"
      className={cn(
        "flex items-center rounded-full border border-[#ffffff16] bg-[--sage-a5] hover:bg-[--sage-a3]",
        className
      )}
      {...buttonProps}
    >
      <motion.div
        className="relative m-0.5 aspect-square"
        variants={{
          initial: {
            rotateZ: "-90deg",
          },
          hover: {
            rotateZ: "-180deg",
          },
        }}
      >
        <ComponentA
          variants={{
            initial: {
              opacity: 1,
            },
            hover: {
              opacity: 0,
            },
          }}
          className="relative p-1"
        />
        <ComponentB
          className="absolute left-0 top-0 p-1 opacity-0"
          variants={{
            initial: {
              opacity: 0,
            },
            hover: {
              opacity: 1,
            },
          }}
        />
      </motion.div>

      <Text
        size={"2"}
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
