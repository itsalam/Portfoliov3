"use client";
import { useWebGLSupport } from "@/lib/hooks";
import { useDebounce } from "@/lib/providers/clientUtils";
import { cn } from "@/lib/utils";
import { m } from "framer-motion";
import {
  ComponentPropsWithoutRef,
  Dispatch,
  ElementRef,
  SetStateAction,
  forwardRef,
  useEffect,
  useMemo,
} from "react";
import { DIRECTION } from "./motion/consts";
import DigitSpinner from "./motion/DigitSpinner";
import SpinDigitSpinner from "./motion/SpinDigitSpinner";

const Loading = forwardRef<
  ElementRef<typeof m.div>,
  ComponentPropsWithoutRef<typeof m.div> & {
    prog: number;
    setLoading: Dispatch<SetStateAction<boolean>>;
  }
>((props, ref) => {
  const { prog, setLoading, ...motionProps } = props;
  const [debounceProg] = useDebounce<number>(prog, 900, 200);
  const webgl = useWebGLSupport();
  const SpinnerComp = webgl ? SpinDigitSpinner : DigitSpinner;

  useEffect(() => {
    if (debounceProg == 100) {
      setTimeout(() => setLoading(false), 1200);
    }
  }, [debounceProg, setLoading]);

  const Spinner = useMemo(() => {
    return (
      <>
        {["hundreds", "tens", "units"].map((key, index) => {
          const digit =
            index === 0
              ? ~~(debounceProg / 100)
              : index === 1
                ? ~~(debounceProg / 10) % 10
                : ~~debounceProg % 10;
          const direction = key === "tens" ? DIRECTION.DOWN : undefined;
          const springOptions = {
            mass: prog >= 99 ? 2 : 2,
            stiffness: prog >= 99 ? 100 : 100,
            damping: prog >= 99 ? 20 : 10,
          };

          return (
            <SpinnerComp
              key={key}
              textProps={{ className: "!leading-none" }}
              direction={direction}
              digit={digit}
              springOptions={springOptions}
            />
          );
        })}
      </>
    );
  }, [SpinnerComp, debounceProg]);

  return (
    <m.div
      ref={ref}
      className={cn(
        "absolute", // basicStyles
        "right-10 bottom-4 flex h-48", // positioning, sizing
        "items-center justify-center gap-1", // layout
        "text-8xl text-[--gray-a7]" // textStyles
      )}
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
      }}
      exit={{ opacity: 0 }}
      {...motionProps}
    >
      {Spinner}
    </m.div>
  );
});

Loading.displayName = "Loading";

export default Loading;
