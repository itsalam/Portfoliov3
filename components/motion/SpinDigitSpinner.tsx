import { cn } from "@/lib/utils";
import { Text } from "@radix-ui/themes";
import {
  m,
  MotionValue,
  SpringOptions,
  useSpring,
  useTransform,
} from "framer-motion";
import React, {
  ComponentProps,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { DigitSpinnerProps, DIRECTION } from "./consts";

const MText = m(Text);

const getDigitDist = (digit1: number, digit2: number) => {
  // Calculate the forward distance
  const forwardDistance = (digit1 - digit2 + 10) % 10;

  // Calculate the backward distance by going from num1 back to num2
  const backwardDistance = (digit2 - digit1 + 10) % 10;

  // Return the smaller of the two distances
  return Math.min(forwardDistance, backwardDistance);
};

const Digit = ({
  style,
  index,
  rotateX,
  ...rest
}: ComponentProps<typeof MText> & {
  index: number;
  rotateX: MotionValue<number>;
}) => {
  const range = [
    ...new Set(
      [0, index - 1, index, index + 1, 9]
        .map((r) => (r < 0 ? 10 + r : r))
        .toSorted((a, b) => a - b)
    ),
  ];
  const output: number[] = range.map((r) =>
    r === index ? 1 : getDigitDist(r, index) === 1 ? 0.1 : 0);

  const opacity = useTransform(
    rotateX,
    range.map((r) => r * -36),
    output
  );

  return (
    <MText
      {...rest}
      style={{
        ...style,
        opacity: opacity as number & MotionValue<number>,
      }}
    />
  );
};

Digit.displayName = "Digit";

const SpinDigitSpinner: React.FC<
  DigitSpinnerProps & { springOptions?: SpringOptions }
> = ({
  digit,
  direction = DIRECTION.DOWN,
  textProps,
  springOptions,
  ...motionProps
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const lastDigit = useRef(digit);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const rotateX = useSpring(0, {
    stiffness: 100,
    damping: 40,
    mass: 20,
    ...springOptions,
  });

  useLayoutEffect(() => {
    if (ref.current) {
      const { width, height } = ref.current.getBoundingClientRect();
      setDimensions({ width, height });
      console.log(`Width: ${width}, Height: ${height}`);
    }
  }, [ref]);

  const getDigitCoord = useCallback(
    (digit: number) => {
      return -direction * digit * 36;
    },
    [direction]
  );

  useEffect(() => {
    lastDigit.current = digit;
    rotateX.set(getDigitCoord(digit));
  }, [digit, rotateX, getDigitCoord]);

  return (
    <m.div
      className="relative overflow-visible"
      style={{
        perspective: "1000px",
        width: dimensions ? dimensions.width : 0,
        height: dimensions ? dimensions.height : 0,
      }}
    >
      <MText
        {...textProps}
        className="opacity-0"
        ref={ref}
      >
        0
      </MText>
      <m.div
        className={cn(
          "absolute bottom-0 flex flex-col-reverse"
        )}
        style={{
          rotateX,
          width: dimensions ? dimensions.width : 0,
          height: dimensions ? dimensions.height : 0,
          transformStyle: "preserve-3d",
          transformOrigin: `center center -${dimensions ? dimensions.height / 2 : 0}px` /* Set origin behind */,
        }}
        {...motionProps}
      >
        {Array.from({ length: 10 }).map((_, i: number) => {
          return (
            <Digit
              index={i}
              rotateX={rotateX}
              {...textProps}
              key={i}
              custom={i}
              animate="visible"
              style={{
                position: "absolute",
                transformOrigin: `center center -${dimensions ? dimensions.height / 2 : 0}px` /* Set origin behind */,
                transform: `rotateX(${i * 36}deg) translateZ(${dimensions ? dimensions.height / 2 : 0}px)`,
              }}
            >
              {i}
            </Digit>
          );
        })}
      </m.div>
    </m.div>
  );
};

export default React.memo(SpinDigitSpinner);
