import { cn } from "@/lib/utils";
import { Text as BaseText } from "@radix-ui/themes";
import { MotionProps, Variants, m } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { ComponentProps, ComponentType, FC } from "react";

const Text = m(BaseText);

export type BaseRolloutProps = {
  className?: string;
  ComponentA: ComponentType<ComponentProps<LucideIcon> & MotionProps>;
  ComponentB: ComponentType<ComponentProps<LucideIcon> & MotionProps>;
  text: string;
  iconVariants?: Variants;
  iconSize?: ComponentProps<LucideIcon>["size"];
  isLink?: boolean;
  textSize?: ComponentProps<typeof Text>["size"];
};

export const BaseRolloutButton: FC<BaseRolloutProps> = (props) => {
  const {
    className,
    ComponentA,
    ComponentB,
    text,
    iconVariants,
    iconSize,
    isLink,
    textSize,
    ...buttonProps
  } = props;

  const Component = isLink ? m.a : m.button;

  return (
    <Component
      whileHover="hover"
      className={cn(
        "border",
        "flex items-center rounded-full border-[--gray-12]", // sizing, layout, border
        "bg-[--gray-a2] backdrop-blur-md", // background, filters
        className
      )}
      {...buttonProps}
    >
      <m.div
        className="relative aspect-square overflow-hidden p-0.5"
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
          className="absolute top-0.5 left-0.5 aspect-square p-1"
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
      </m.div>

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
    </Component>
  );
};
