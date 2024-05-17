import { cn } from "@/lib/utils";
import { Text } from "@radix-ui/themes";
import { motion } from "framer-motion";
import React, { ComponentProps, useCallback, useEffect, useRef } from "react";

export enum DIRECTION {
  UP = -1,
  DOWN = 1,
}

type DigitSpinnerProps = ComponentProps<typeof motion.div> & {
  textProps?: ComponentProps<typeof Text>;
  digit: number;
  direction?: DIRECTION;
};

export const DigitSpinner: React.FC<DigitSpinnerProps> = ({
  digit,
  direction = DIRECTION.DOWN,
  textProps,
  ...motionProps
}) => {
  const currDigit = useRef(digit);
  const lastDigit = useRef(digit);

  const getDigitCoord = useCallback(
    (digit: number) => {
      return `${(direction * digit * 100) / 11}%`;
    },
    [direction]
  );

  const getDigitCoords = useCallback(() => {
    if (currDigit.current === lastDigit.current)
      return getDigitCoord(currDigit.current);
    if (lastDigit.current === 9 && currDigit.current === 0) {
      return [
        getDigitCoord(lastDigit.current),
        getDigitCoord(lastDigit.current + 1),
      ];
    }
    return [getDigitCoord(lastDigit.current), getDigitCoord(currDigit.current)];
  }, [getDigitCoord]);

  useEffect(() => {
    currDigit.current = digit;
    return () => {
      lastDigit.current = digit;
    };
  }, [digit]);
  return (
    <motion.div className="relative overflow-hidden">
      <Text
        {...textProps}
        className="opacity-0"
      >
        0
      </Text>
      <motion.div
        key={digit}
        className={cn(
          "absolute flex",
          {
            "bottom-0 flex-col-reverse ": direction === DIRECTION.DOWN,
            "top-0 flex-col ": direction === DIRECTION.UP,
          }
        )}
        animate={{
          y: getDigitCoords(),
        }}
        {...motionProps}
      >
        {Array.from({ length: 11 }).map((_, i: number) => (
          <Text {...textProps} key={i}>
            {i % 10}
          </Text>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default DigitSpinner;
