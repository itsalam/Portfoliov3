import { maskScrollArea } from "@/lib/clientUtils";
import { useResizeCallBack } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { Variant, animate, motion, useMotionValue } from "framer-motion";
import {
  Children,
  ComponentPropsWithRef,
  HTMLAttributes,
  MouseEvent,
  MouseEventHandler,
  MutableRefObject,
  ReactNode,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TrackBar } from "./Trackbar";

const Track = (
  props: ComponentPropsWithRef<typeof motion.div> & {
    dragRef: MutableRefObject<boolean>;
    clickedIndex: MutableRefObject<number>;
  }
) => {
  const { className, children, dragRef, clickedIndex, ...restProps } = props;
  const [maxDist, setMaxDist] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const startDrag = useRef(0);
  const dist = useMotionValue(0);
  const numItems = useMemo(
    () => Children.count(children as ReactNode),
    [children]
  );
  const [itemWidth, setItemWidth] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = dist.on("change", (value) => {
      const containerElement = containerRef.current;
      if (containerElement) {
        const middleStepPercent = Math.abs(value / maxDist);
        maskScrollArea("right", containerElement, middleStepPercent);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [dist, maxDist]);

  const handleResize = useCallback(() => {
    const trackSize = trackRef.current?.getBoundingClientRect().width || 0,
      containerSize = containerRef.current?.getBoundingClientRect().width || 0;
    setMaxDist(containerSize - trackSize);
    setItemWidth(
      (trackRef.current?.children[0] as HTMLDivElement)?.offsetWidth ?? 0
    );
  }, []);

  useResizeCallBack(handleResize, trackRef, containerRef);

  const setTrackDist = useCallback(
    (coord: number, threshold?: number, useAnimate?: boolean) => {
      const thresholdDist = (threshold ?? 0) * maxDist;
      const coordDist = Math.min(
        Math.max(coord, maxDist + thresholdDist),
        0 - thresholdDist
      );
      if (useAnimate) {
        animate(dist, coordDist, {
          type: "spring",
          damping: 50,
        });
      } else {
        dist.set(coordDist);
      }
    },
    [dist, maxDist]
  );

  const panToElement =
    (index: number, priorOnClick?: MouseEventHandler) => (e?: MouseEvent) => {
      const track = trackRef.current;
      const elem = track?.children[index];
      const container = containerRef.current;
      if (elem && track && container && !dragRef.current) {
        setTrackDist(
          track.getBoundingClientRect().x -
            elem.getBoundingClientRect().x +
            (container.getBoundingClientRect().width -
              elem.getBoundingClientRect().width) /
              2,
          0,
          true
        );
      }
      e && priorOnClick?.(e);
    };

  const trackChildren = Children.map(children as ReactNode, (child, index) =>
    isValidElement(child) && typeof child.type !== "string"
      ? cloneElement(child, {
          onClick: panToElement(index, child.props.onClick),
        } as HTMLAttributes<HTMLElement>)
      : child
  );

  useEffect(() => {
    const containerElement = containerRef.current;
    if (!containerElement) return;
    maskScrollArea("right", containerElement, 0);
  }, []);

  useEffect(() => {
    const containerElement = containerRef.current;
    const handleWheelMove = (e: WheelEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setTrackDist(dist.get() + e.deltaY * -0.33), 0.1;
    };

    if (!containerElement) return;
    containerElement.addEventListener("wheel", handleWheelMove, {
      passive: false,
    });
    return () => {
      containerElement?.removeEventListener("wheel", handleWheelMove);
    };
  }, [dist, setTrackDist]);

  return (
    <>
      <TrackBar
        dist={dist}
        trackRef={trackRef}
        itemWidth={itemWidth}
        containerWidth={
          containerRef.current?.getBoundingClientRect().width || 0
        }
        numItems={numItems}
      />
      <motion.div
        {...restProps}
        className={cn(
          "track-container relative my-auto flex w-full overflow-visible",
          className,
          {
            "cursor-grabbing": startDrag.current,
            "cursor-grab": !startDrag.current,
          }
        )}
        // onWheel={handleWheelMove}
        onMouseLeave={() => {
          if (!startDrag.current && clickedIndex.current !== -1) {
            panToElement(clickedIndex.current)();
          }
        }}
        ref={containerRef}
        id="container"
      >
        <motion.div
          ref={trackRef}
          drag="x"
          style={{
            x: dist,
          }}
          className={cn("track relative flex items-start gap-g-2/8", {})}
          suppressHydrationWarning
          id="track"
          dragConstraints={{
            left: maxDist,
            right: 0,
          }}
          // dragTransition={{ power: 0.1 }}
          variants={{
            selected: {
              "--mask-height": 0.4,
            } as Variant,
            deselected: {
              "--mask-height": -0.1,
            } as Variant,
          }}
        >
          {trackChildren}
        </motion.div>
      </motion.div>
    </>
  );
};

export default Track;
