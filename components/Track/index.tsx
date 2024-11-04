import { maskScrollArea } from "@/lib/clientUtils";
import { useResizeCallBack } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import {
  animate,
  m,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
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
  props: ComponentPropsWithRef<"div"> & {
    dragRef: MutableRefObject<boolean>;
    clickedIndex: number;
  }
) => {
  const { className, children, dragRef, clickedIndex, ...restProps } = props;
  const [maxDist, setMaxDist] = useState(0);
  const [maxPercentage, setMaxPercentage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const startDrag = useRef(0);
  const dist = useMotionValue(0);
  const numItems = useMemo(
    () => Children.count(children as ReactNode),
    [children]
  );
  const [itemWidth, setItemWidth] = useState<number>(0);
  const distPercent = useTransform(
    dist,
    (x) => -((x / maxDist) * maxPercentage) * 100
  );

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
    setMaxPercentage(Math.abs((containerSize - trackSize) / trackSize));
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

  const panToElement = (index: number, priorOnClick?: MouseEventHandler) =>
    (e?: MouseEvent) => {
      const track = trackRef.current;
      const elem = track?.children[index];
      const container = containerRef.current;
      console.log(elem, track, container, dragRef)
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
        onTap: panToElement(index, child.props.onTap),
      } as HTMLAttributes<HTMLElement>)
      : child);

  useEffect(() => {
    const containerElement = containerRef.current;
    if (!containerElement) return;
    maskScrollArea("right", containerElement, 0);
  }, []);

  useEffect(() => {
    panToElement(clickedIndex)()
    console.log(clickedIndex, " UHHUH")
  }, [clickedIndex])

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
      <div
        {...restProps}
        className={cn(
          "track-container flex w-full overflow-visible",
          className,
          {
            "cursor-grabbing": startDrag.current,
            "cursor-grab": !startDrag.current,
          }
        )}
        onMouseLeave={() => {
          if (!startDrag.current && clickedIndex !== -1) {
            panToElement(clickedIndex)();
          }
        }}
        ref={containerRef}
        id="container"
      >
        <m.div
          ref={trackRef}
          drag="x"
          style={{
            x: useMotionTemplate`${distPercent}%`,
          }}
          className={cn(
            "track flex w-max items-start gap-g-2/8 px-4",
            {}
          )}
          suppressHydrationWarning
          id="track"
          dragConstraints={{
            left: maxDist,
            right: 0,
          }}
        >
          {trackChildren}
        </m.div>
      </div>
      <TrackBar
        distPercent={distPercent}
        trackRef={trackRef}
        itemWidth={itemWidth}
        containerWidth={
          containerRef.current?.getBoundingClientRect().width || 1
        }
        numItems={numItems}
      />
    </>
  );
};

export default Track;
