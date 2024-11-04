import { cn } from "@/lib/utils";
import { Text } from "@radix-ui/themes";
import { m, useMotionTemplate, useSpring } from "framer-motion";
import React, { useCallback, useEffect, useRef } from "react";
import { DigitSpinnerProps, DIRECTION } from "./consts";

const MText = m(Text);

const DigitSpinner: React.FC<DigitSpinnerProps> = ({
  digit,
  direction = DIRECTION.DOWN,
  textProps,
  springOptions,
  ...motionProps
}) => {
  const lastDigit = useRef(digit);
  const yBase = useSpring(0, {
    stiffness: 100,
    damping: 30,
    ...springOptions,
  });

  const getDigitCoord = useCallback(
    (digit: number) => {
      return (direction * digit * 100) / 10;
    },
    [direction]
  );

  useEffect(() => {
    lastDigit.current = digit;
    yBase.set(getDigitCoord(digit));
  }, [digit, getDigitCoord, yBase]);

  return (
    <m.div
      className="relative overflow-visible leading-none"
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <MText
        {...textProps}
        className="!leading-[inherit] opacity-0"
      >
        0
      </MText>
      <m.div
        className={cn(
          "absolute flex",
          {
            "bottom-[2px] flex-col-reverse ": direction === DIRECTION.DOWN,
            "top-[2px] flex-col ": direction === DIRECTION.UP,
          }
        )}
        transition={{
          duration: 0.8,
          ease: [0.85, 0, 0.15, 1],
        }}
        style={{
          y: useMotionTemplate`${yBase}%`,
        }}
        {...motionProps}
      >
        {Array.from({ length: 10 }).map((_, i: number) => (
          <MText
            className="!leading-[inherit]"
            {...textProps}
            key={i}
          >
            {i}
          </MText>
        ))}
      </m.div>
    </m.div>
  );
};

export default React.memo(DigitSpinner);
