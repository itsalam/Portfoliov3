"use client";
import { useDebounce } from "@/lib/clientUtils";
import { motion } from "framer-motion";
import {
  ComponentPropsWithoutRef,
  Dispatch,
  ElementRef,
  SetStateAction,
  forwardRef,
  useCallback,
} from "react";
import { DIRECTION, DigitSpinner } from "./motion/DigitSpinner";

const Loading = forwardRef<
  ElementRef<typeof motion.div>,
  ComponentPropsWithoutRef<typeof motion.div> & {
    prog: number;
    setLoading: Dispatch<SetStateAction<boolean>>;
  }
>((props, ref) => {
  const { prog, setLoading, ...motionProps } = props;
  const debounceProg = useDebounce<number>(prog, 1500);
  // todo: make HOC control the animation, digit component should have digits based on digit size (1s get 100 numbers)

  // Callback to be invoked when an animation completes

  const Spinner = useCallback(() => {
    const handleAnimationComplete = () => {
      if (debounceProg >= 100) {
        setTimeout(() => {
          setLoading(false); // Or any other action you need to perform
        }, 1000);
      }
    };

    return (
      <>
        <DigitSpinner
          digit={~~(debounceProg / 100)}
          onAnimationComplete={handleAnimationComplete}
        />
        <DigitSpinner
          direction={DIRECTION.UP}
          digit={~~(debounceProg / 10) % 10}
        />
        <DigitSpinner digit={~~debounceProg % 10} />
      </>
    );
  }, [debounceProg, setLoading]);

  return (
    <motion.div
      ref={ref}
      className="absolute bottom-4 right-10 flex h-36 items-start justify-center gap-1 overflow-hidden font-favorit text-8xl text-[--gray-a7]"
      {...motionProps}
    >
      <Spinner />
    </motion.div>
  );
});

Loading.displayName = "Loading";

export default Loading;
