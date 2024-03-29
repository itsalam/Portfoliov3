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
    itemWidth = 0,
    ...restProps
  } = props;
  const barRef = useRef<HTMLDivElement>(null);
  const trackWidth = trackRef.current?.getBoundingClientRect().width ?? 1;
  const gapWidth = ((trackWidth ?? 0) - itemWidth * numItems) / (numItems - 1);
  const ratio = containerWidth / trackWidth;
  const x = useTransform(dist, (x) => x * -ratio);
  return (
    <motion.div
      {...restProps}
      ref={barRef}
      className={cn("relative h-[5px] w-full", className)}
    >
      {Array.from({ length: numItems }, (_, i) => (
        <motion.div
          key={i}
          style={{
            width: itemWidth * ratio || 0,
            x: i * (itemWidth + gapWidth) * ratio,
          }}
          className="absolute left-0 top-0 h-[3px] bg-[--sage-a6]"
        />
      ))}
      <motion.div
        onPan={(e, info) => {
          dist.set(
            -Math.max(Math.min(trackWidth * ratio, info.offset.x), 0) / ratio
          );
        }}
        className="absolute -top-[3px] z-20 h-[9px] border border-[--sage-a9]"
        style={{ width: containerWidth * ratio, x }}
      />
    </motion.div>
  );
};
