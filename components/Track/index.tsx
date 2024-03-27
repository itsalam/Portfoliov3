import { maskScrollArea, useResizeCallBack } from "@/lib/clientUtils";
import { cn } from "@/lib/utils";
import {
  MotionStyle,
  Variant,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import {
  Children,
  ComponentPropsWithRef,
  HTMLAttributes,
  MouseEvent,
  MouseEventHandler,
  MutableRefObject,
  ReactNode,
  WheelEventHandler,
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
  const {
    className,
    children,
    onHoverEnd,
    dragRef,
    clickedIndex,
    ...restProps
  } = props;
  const [maxDist, setMaxDist] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const startDrag = useRef(0);
  const dist = useMotionValue(0);
  const springDist = useSpring(dist, { damping: 30 });
  const numItems = useMemo(
    () => Children.count(children as ReactNode),
    [children]
  );
  const [itemWidth, setItemWidth] = useState<number>(0);

  dist.on("change", (value) => {
    const containerElement = containerRef.current;
    if (containerElement) {
      const middleStepPercent = Math.abs(value / maxDist);
      maskScrollArea("right", containerElement, middleStepPercent);
    }
  });

  const handleResize = useCallback(() => {
    const trackSize = trackRef.current?.getBoundingClientRect().width || 0,
      containerSize = containerRef.current?.getBoundingClientRect().width || 0;
    setMaxDist(containerSize - trackSize);
    setItemWidth(
      (trackRef.current?.children[0] as HTMLDivElement)?.offsetWidth ?? 0
    );
  }, []);

  useResizeCallBack(handleResize, trackRef, containerRef);

  const setTrackDist = (coord: number, threshold?: number) => {
    const thresholdDist = (threshold ?? 0) * maxDist;
    dist.set(
      Math.min(Math.max(coord, maxDist + thresholdDist), 0 - thresholdDist)
    );
  };

  const handleWheelMove: WheelEventHandler<HTMLDivElement> = (e) => {
    setTrackDist(dist.get() + e.deltaY * -0.33), 0.1;
  };

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = (e) => {
    const containerElement = containerRef.current;
    if (containerElement && startDrag.current) {
      setTrackDist(dist.get() + e.movementX, 0.1);
    }
  };

  const panToElement =
    (index: number, priorOnClick?: MouseEventHandler) => (e?: MouseEvent) => {
      const track = trackRef.current;
      const elem = track?.children[index];
      const container = containerRef.current;
      console.log({ elem, track, container, dragRef });
      if (elem && track && container && !dragRef.current) {
        setTrackDist(
          track.getBoundingClientRect().x -
            elem.getBoundingClientRect().x +
            (container.getBoundingClientRect().width -
              elem.getBoundingClientRect().width) /
              2
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
        className=""
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
        onHoverEnd={(e, i) => {
          onHoverEnd?.(e, i);
        }}
        onMouseMove={handleMouseMove}
        onMouseDown={(e) => {
          startDrag.current = e.clientX;
        }}
        onMouseLeave={() => {
          console.log(!startDrag.current, clickedIndex.current);
          if (!startDrag.current && clickedIndex.current !== -1) {
            console.log(!startDrag.current, clickedIndex.current);

            panToElement(clickedIndex.current)();
          }
        }}
        onMouseUp={(e) => {
          dragRef.current = Math.abs(startDrag.current - e.clientX) > 5;
          startDrag.current = 0;
          setTimeout(() => (dragRef.current = false), 25);
        }}
        onWheel={handleWheelMove}
        ref={containerRef}
        id="container"
      >
        <motion.div
          ref={trackRef}
          style={
            {
              x: springDist,
            } as MotionStyle
          }
          className={cn("track relative flex items-start gap-g-x-2/8", {})}
          suppressHydrationWarning
          id="track"
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
