import { cn } from "@/lib/utils";
import { Text } from "@radix-ui/themes";
import { m } from "framer-motion";
import React, { ComponentProps, useCallback, useEffect, useRef } from "react";

export enum DIRECTION {
  UP = -1,
  DOWN = 1,
}

type DigitSpinnerProps = ComponentProps<typeof m.div> & {
  textProps?: ComponentProps<typeof Text>;
  digit: number;
  direction?: DIRECTION;
};

const DigitSpinner: React.FC<DigitSpinnerProps> = ({
  digit,
  direction = DIRECTION.DOWN,
  textProps,
  ...motionProps
}) => {
  const lastDigit = useRef(digit);

  const getDigitCoord = useCallback(
    (digit: number) => {
      return `${(direction * digit * 100) / 10}%`;
    },
    [direction]
  );

  const getDigitCoords = useCallback((): [string, string] => {
    const fromCoord = getDigitCoord(lastDigit.current);
    const toCoord = getDigitCoord(digit);
    return [fromCoord, toCoord];
  }, [getDigitCoord, digit]);

  useEffect(() => {
    lastDigit.current = digit;
  }, [digit]);

  const [fromCoord, toCoord] = getDigitCoords();

  return (
    <m.div className="relative overflow-hidden">
      <Text
        {...textProps}
        className="opacity-0"
      >
        0
      </Text>
      <m.div
        className={cn(
          "absolute flex",
          {
            "bottom-0 flex-col-reverse ": direction === DIRECTION.DOWN,
            "top-0 flex-col ": direction === DIRECTION.UP,
          }
        )}
        initial={{ y: fromCoord }}
        animate={{ y: toCoord }}
        transition={{
          duration: 0.8,
          ease: [0.85, 0, 0.15, 1],
        }}
        {...motionProps}
      >
        {Array.from({ length: 10 }).map((_, i: number) => (
          <Text {...textProps} key={i}>
            {i}
          </Text>
        ))}
      </m.div>
    </m.div>
  );
};

export default React.memo(DigitSpinner);
