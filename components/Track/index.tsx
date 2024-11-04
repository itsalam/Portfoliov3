import { useResizeCallBack } from "@/lib/hooks";
import { maskScrollArea } from "@/lib/providers/clientUtils";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@radix-ui/themes";
import { animate, m, useMotionValue } from "framer-motion";
import {
  Children,
  ComponentPropsWithoutRef,
  HTMLAttributes,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
  RefObject,
  cloneElement,
  forwardRef,
  isValidElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
const Track = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof m.div> & {
    trackRef: RefObject<HTMLDivElement>;
    clickedIndex: number;
  }
>((props, containerRef) => {
  const { className, children, clickedIndex, trackRef, ...restProps } = props;
  const [maxDist, setMaxDist] = useState(0);
  const fallBackRef = useRef<HTMLDivElement>(null);
  // Expose the ref, preferring the passed `ref` if defined, otherwise using `innerRef`
  useImperativeHandle(
    containerRef,
    () => fallBackRef.current as HTMLDivElement
  );
  const startDrag = useRef(0);
  const dist = useMotionValue(0);

  useEffect(() => {
    const unsubscribe = dist.on("change", (value) => {
      const containerElement = (containerRef as React.RefObject<HTMLDivElement>)
        ?.current;
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
      containerSize =
        (
          containerRef as RefObject<HTMLDivElement>
        ).current?.getBoundingClientRect().width || 0;

    setMaxDist(containerSize - trackSize);
  }, []);

  useResizeCallBack(
    handleResize,
    trackRef,
    containerRef as React.RefObject<HTMLDivElement>
  );

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

  const panToElement = useCallback(
    (index: number, priorOnClick?: MouseEventHandler) => (e?: MouseEvent) => {
      const track = trackRef.current;
      const elem = track?.children[index];
      const container = (containerRef as RefObject<HTMLDivElement>).current;
      if (elem && track && container) {
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
    },
    []
  );

  const trackChildren = Children.map(children as ReactNode, (child, index) =>
    isValidElement(child) && typeof child.type !== "string"
      ? cloneElement(child, {
          onTap: panToElement(index, child.props.onTap),
        } as HTMLAttributes<HTMLElement>)
      : child);

  useEffect(() => {
    const containerElement = (containerRef as RefObject<HTMLDivElement>)
      .current;
    if (!containerElement) return;
    maskScrollArea("bottom", containerElement, 0);
  }, []);

  useEffect(() => {
    panToElement(clickedIndex)();
  }, [clickedIndex, panToElement]);

  useEffect(() => {
    const containerElement = (containerRef as RefObject<HTMLDivElement>)
      .current;
    const handleWheelMove = (e: WheelEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setTrackDist(dist.get() + e.deltaY * -0.33), 0.1;
    };

    if (!containerElement) return;
    // containerElement.addEventListener("wheel", handleWheelMove, {
    //   passive: false,
    // });
    return () => {
      containerElement?.removeEventListener("wheel", handleWheelMove);
    };
  }, [dist, setTrackDist]);

  return (
    <>
      <m.div
        {...restProps}
        layout
        className={cn(
          "track-container overflow-y-auto",
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
        ref={containerRef || fallBackRef}
        id="container"
      >
        <ScrollArea
          // layoutScroll
          ref={trackRef}
          // drag="x"
          // style={{
          //   x: useMotionTemplate`${distPercent}%`,
          // }}
          className={cn(
            "track",
            {}
          )}
          id="track"
        >
          {trackChildren}
        </ScrollArea>
      </m.div>
    </>
  );
});

Track.displayName = "Track";

export default Track;
