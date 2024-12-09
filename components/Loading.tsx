"use client";
import { useWebGLSupport } from "@/lib/hooks";
import { useDebounce } from "@/lib/providers/clientUtils";
import { cn } from "@/lib/utils";
import { m } from "framer-motion";
import { debounce } from "lodash";
import {
  ComponentPropsWithoutRef,
  Dispatch,
  ElementRef,
  SetStateAction,
  forwardRef,
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
  const [debounceProg] = useDebounce<number>(prog, 1200, 200);
  const webgl = useWebGLSupport();
  const SpinnerComp = webgl ? SpinDigitSpinner : DigitSpinner;

  const debounceSetLoading = debounce((b: boolean) => setLoading(b), 100, {
    maxWait: 1800,
  });

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
            mass: prog >= 99 ? 6 : 4,
            stiffness: prog >= 99 ? 100 : 100,
            damping: prog >= 99 ? 50 : 30,
          };

          return (
            <SpinnerComp
              endLoadingCallback={() => {
                console.log(debounceProg);
                if (index === 0 && debounceProg == 100) {
                  debounceSetLoading(false);
                }
              }}
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
  }, [SpinnerComp, debounceProg, prog, setLoading]);

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
      initial={{ opacity: 0 }}
      animate={{ opacity: [null, 1] }}
      exit={{ opacity: 0 }}
      {...motionProps}
    >
      {Spinner}
    </m.div>
  );
});

Loading.displayName = "Loading";

export default Loading;
