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
  }
) => {
  const {
    className,
    numItems,
    distPercent,
    trackRef,
    containerWidth,
    itemWidth = 0,
    ...restProps
  } = props;
  const barRef = useRef<HTMLDivElement>(null);
  const trackWidth = trackRef.current?.getBoundingClientRect().width ?? 1;
  const gapWidth = ((trackWidth ?? 0) - itemWidth * numItems) / (numItems - 1);
  const ratio = containerWidth / trackWidth;
  const scaleRef = useRef(1);

  const x = useTransform(() => -distPercent.get() / ratio);

  useEffect(() => {
    if (barRef.current) {
      scaleRef.current =
        barRef.current?.getBoundingClientRect().width / containerWidth;
    }
  }, [barRef, containerWidth]);

  return (
    <div
      {...restProps}
      ref={barRef}
      className={cn(
        "relative m-4 my-2.5 mb-0 h-[5px]",
        className
      )}
    >
      {Array.from({ length: numItems }, (_, i) => (
        <m.div
          key={i}
          style={{
            width: itemWidth * ratio * scaleRef.current,
            x: i * (itemWidth + gapWidth) * ratio * scaleRef.current,
          }}
          className="absolute top-0 left-0 h-[3px] rounded-sm bg-[--accent-a4]"
        />
      ))}
      <m.div
        className={cn(
          "border",
          "absolute -top-[3px] left-0 z-20", // basicStyles, positioning, layoutControl
          "h-[9px] rounded-sm border-[--accent-a7]" // sizing, border
        )}
        style={{
          width: containerWidth * ratio * scaleRef.current,
          x: useMotionTemplate`${x}%`,
        }}
      />
    </div>
  );
};
