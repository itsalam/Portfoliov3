import { cn } from "@/lib/utils";
import { MotionValue, motion, useTransform } from "framer-motion";
import { ComponentPropsWithRef, RefObject, useRef } from "react";

export const TrackBar = (
  props: ComponentPropsWithRef<typeof motion.div> & {
    trackRef: RefObject<HTMLDivElement>;
    containerWidth: number;
    itemWidth: number;
    dist: MotionValue;
    numItems: number;
  }
) => {
  const {
    className,
    numItems,
    dist,
    trackRef,
    containerWidth,
    itemWidth,
    ...restProps
  } = props;
  const barRef = useRef<HTMLDivElement>(null);
  const trackWidth = trackRef.current?.getBoundingClientRect().width;
  const gapWidth = ((trackWidth ?? 0) - itemWidth * numItems) / (numItems - 1);
  const ratio = containerWidth / (trackWidth ?? 1);
  const x = useTransform(dist, (x) => x * -ratio);
  return (
    <motion.div
      {...restProps}
      ref={barRef}
      className={cn("h-[5px] w-full relative", className)}
    >
      {Array.from({ length: numItems }, (_, i) => (
        <motion.div
          key={i}
          style={{
            width: itemWidth * ratio || 0,
            x: i * (itemWidth + gapWidth) * ratio,
          }}
          className="absolute h-[3px] top-0 left-0 bg-[--sage-5]"
        />
      ))}
      <motion.div
        onPan={(e, info) => {
          dist.set(
            -Math.max(Math.min((trackWidth ?? 1) * ratio, info.offset.x), 0) /
              ratio
          );
        }}
        className="z-20 h-[9px] -top-[3px] absolute border border-[--sage-9]"
        style={{ width: containerWidth * ratio, x }}
      />
    </motion.div>
  );
};
