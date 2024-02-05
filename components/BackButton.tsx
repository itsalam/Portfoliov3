import { cn } from "@/lib/utils";
import { Text as BaseText } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { MoveRight as BaseMoveRight, X as BaseX } from "lucide-react";
import { ComponentProps, FC } from "react";

const X = motion(BaseX);
const MoveRight = motion(BaseMoveRight);
const Text = motion(BaseText);

export const BackButton: FC<ComponentProps<typeof motion.button>> = (props) => {
  const { className, ...buttonProps } = props;

  return (
    <motion.button
      whileHover="hover"
      className={cn(
        "absolute z-50 rounded-full border border-[#ffffff16] flex items-center",
        className
      )}
      {...buttonProps}
    >
      <motion.div
        className="aspect-square m-0.5 relative"
        variants={{
          initial: {
            rotateZ: "-90deg",
          },
          hover: {
            rotateZ: "-180deg",
          },
        }}
      >
        <X
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
        <MoveRight
          className="absolute top-0 left-0 opacity-0 p-1"
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
        className="overflow-hidden whitespace-nowrap relative w-0"
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
        Back
      </Text>
    </motion.button>
  );
};
