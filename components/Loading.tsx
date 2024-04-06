"use client";
import { useDebounce } from "@/lib/clientUtils";
import { Text } from "@radix-ui/themes";
import { motion } from "framer-motion";
import {
  ComponentPropsWithoutRef,
  Dispatch,
  ElementRef,
  SetStateAction,
  forwardRef,
  useEffect,
  useState,
} from "react";

const DIGITS = 3;

const Loading = forwardRef<
  ElementRef<typeof motion.div>,
  ComponentPropsWithoutRef<typeof motion.div> & {
    prog: number;
    setLoading: Dispatch<SetStateAction<boolean>>;
  }
>((props, ref) => {
  const { prog, setLoading, ...motionProps } = props;
  const debounceProg = useDebounce<number>(prog, 1000);
  // todo: make HOC control the animation, digit component should have digits based on digit size (1s get 100 numbers)
  const [completedAnimations, setCompletedAnimations] = useState(0);

  useEffect(() => {
    // Reset the count when `prog` changes
    setCompletedAnimations(0);
  }, [prog]);

  // Callback to be invoked when an animation completes
  const handleAnimationComplete = () => {
    if (debounceProg >= 100) {
      setCompletedAnimations((prevCount: number) => prevCount + 1);
    }
  };

  useEffect(() => {
    if (completedAnimations >= DIGITS) {
      // All digit animations have completed
      setLoading(false); // Or any other action you need to perform
    }
  }, [completedAnimations, setLoading]);

  return (
    <motion.div
      ref={ref}
      className="absolute bottom-4 right-10 flex h-36 items-start justify-center gap-1 overflow-hidden font-favorit text-8xl text-[--gray-a7]"
      {...motionProps}
    >
      {Array.from({ length: DIGITS })
        .map((_, index: number) => Math.pow(10, index))
        .map((digit) => (
          <motion.div
            key={digit}
            className="flex flex-col"
            animate={{
              y: [null, `-${~~(debounceProg / (100 / digit)) * 9}rem`],
            }}
            onAnimationComplete={handleAnimationComplete}
            transition={{
              type: "tween",
              ease: "easeInOut", // This can be adjusted to different easing options
              duration: 1.5, // Duration of the transition (in seconds)
            }}
          >
            {Array.from({ length: digit + 1 }).map((_, i: number) => (
              <Text key={i}>{i % 10}</Text>
            ))}
          </motion.div>
        ))}
    </motion.div>
  );
});

Loading.displayName = "Loading";

export default Loading;
