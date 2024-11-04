import { cn } from "@/lib/utils";
import { MotionValue, m, useMotionTemplate, useTransform } from "framer-motion";
import { ComponentPropsWithRef, RefObject, useEffect, useRef } from "react";

export const TrackBar = (
  props: ComponentPropsWithRef<"div"> & {
    trackRef: RefObject<HTMLDivElement>;
    containerWidth: number;
    itemWidth: number;
    distPercent: MotionValue;
    numItems: number;
    clickedIndex?: number | null;
  }
) => {
  const {
    className,
    numItems,
    distPercent,
    trackRef,
    containerWidth: contianerHeight,
    itemWidth = 0,
    clickedIndex = null,
    ...restProps
  } = props;
  const barRef = useRef<HTMLDivElement>(null);
  const trackWidth = trackRef.current?.getBoundingClientRect().height ?? 1;
  const gapWidth = ((trackWidth ?? 0) - itemWidth * numItems) / (numItems - 1);
  const ratio = contianerHeight / trackWidth;
  const scaleRef = useRef(1);

  const y = useTransform(() => -distPercent.get() / ratio);

  useEffect(() => {
    if (barRef.current) {
      scaleRef.current =
        barRef.current?.getBoundingClientRect().height / contianerHeight;
    }
  }, [barRef, contianerHeight]);

  return (
    <div
      {...restProps}
      ref={barRef}
      className={cn(
        "relative my-auto mb-0 w-[24px]",
        className
      )}
    >
      {Array.from({ length: numItems }, (_, i) => (
        <m.div
          key={i}
          style={{
            height: itemWidth * ratio * scaleRef.current,
            y: i * (itemWidth + gapWidth) * ratio * scaleRef.current,
          }}
          className={cn(
            "border",
            "absolute top-0 left-0 w-2/3", // basicStyles, positioning, sizing
            "overflow-hidden rounded-sm border-current", // overflowControl, border
            clickedIndex === i ? "text-[--accent-a2]" : "text-[--accent-a7]"
          )}
        >
          <div className="h-1 w-full bg-current" />
        </m.div>
      ))}
      <m.div
        className={cn(
          "border",
          "absolute -left-[3px] left-0 z-20", // basicStyles, positioning, layoutControl
          "w-full border-[--gray-10]" // sizing, border
        )}
        style={{
          height: contianerHeight * ratio * scaleRef.current + 6,
          y: useMotionTemplate`calc(${y}% - 3px)`,
        }}
      />
    </div>
  );
};
