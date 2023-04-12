import cn from "classnames";
import anime from "animejs";
import { debounce, now } from "lodash";
import useStore from "@src/store";
import { ReactNode, useRef, useState, useEffect, memo, forwardRef, useMemo, useCallback } from "react";
import React from "react";

function Selector(props) {
    let { radius, stroke, progress, innerRef, ...otherProps } = props;

    const normalizedRadius = (radius - stroke * 2);
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - progress * circumference;
    return (
      <svg
        ref={innerRef}
        {...otherProps}
        height={radius * 2}
        width={radius * 2}
        >        
        <circle
          stroke={"currentColor"}
          fill="transparent"
          strokeWidth={ stroke/2 }
          strokeDasharray={ circumference + ' ' + circumference }
          style={ { strokeDashoffset } }
          r={ normalizedRadius }
          cx={ radius }
          cy={ radius }
          />
        <circle
          stroke={"currentColor"}
          fill="transparent"
          strokeWidth={ stroke/2 }
          strokeDasharray={ circumference + ' ' + circumference }
          r={ normalizedRadius }
          cx={ radius }
          cy={ radius }
          opacity={ .2 }
          />
        <circle
            fill={"currentColor"}
            r={ normalizedRadius/2 }
            cx={ radius }
            cy={ radius }
            />
      </svg>
    );
}

const RADIUS = 12;

function Menu({ vertical = true }) {
    
    const START = vertical ? "top" : "left";
    const END = vertical ? "bottom" : "right";
    const SIZE = vertical ? "height" : "width";

    const storeProgress = useStore().progress;
    const [progress, setProgress] = useState(0)
    const [isMoving, setIsMoving] = useState(false);
    const { activePage, pages, setActivePage } = useStore.getState();

    const menuRef = useRef<HTMLDivElement>(null);
    const menuItemRef = pages.map(() => useRef<HTMLAnchorElement>(null));

    const [currCoords, setCurrCoords] = useState<number>();


    const MenuSelector = useCallback(() => <Selector
            id="selector"
            progress={progress}
            stroke={3}
            radius={RADIUS}
            className={cn(
                `absolute brightness-125 translate-y-3`,
                )}
            style={currCoords !== undefined ? { [START]: `${currCoords}px` } : {}}
        />, [progress]
    )

    const getMenuCoord = (index: number) => {
        if (!menuItemRef[index]?.current) {
            return 0;
        }
        const menuCoords = menuItemRef[index]?.current?.getBoundingClientRect();
        const offset = menuRef.current?.getBoundingClientRect()[START] ?? 0;
        return (
            (menuCoords[START] + menuCoords[END]) / 2 -
            RADIUS -
            offset
        );
    };

    const moveSelector = debounce((i: number, fromScroll?: boolean) => {
        const moveVal = getMenuCoord(i);
        setIsMoving(true);
        return anime({
            targets: "#selector",
            [START]: moveVal,
            duration: 350,
            easing: "easeOutQuart",
            complete: () => {
                const oldCoord = currCoords;
                setIsMoving(false);
                setCurrCoords(moveVal);
                console.log(oldCoord, currCoords);
                if(fromScroll){
                    setProgress(oldCoord < currCoords? 0: 100)
                }
            }
        })
    }, 150, { leading: true });

    useEffect(() => {
        if (!isMoving) {
            setProgress(storeProgress)
        }
    }, [storeProgress])

    const updateSelector = debounce((i?: number) =>
        (selectorRef.current!.style[START] = `${i || currCoords}px`), 300);

    useEffect(() => {
        moveSelector(activePage, true)
    }, [activePage]);

    useEffect(() => {
    
        setCurrCoords(getMenuCoord(activePage))
        window.addEventListener("resize", () => updateSelector());
        return () => window.removeEventListener("resize", () => updateSelector());
    }, []);

    const Divider = () => <div className={"w-[2px] h-4 bg-foreground m-auto brightness-75"} />

    const onMouseClick = (index: number, event:React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        event.preventDefault();
        setActivePage(index)
        setCurrCoords(getMenuCoord(index))
        window.location.assign(event.currentTarget.href);
    }

    const MenuButton = (props: { index: number, isTop: boolean, isBottom: boolean, text: string }) => {
        const { index, isTop, isBottom, text } = props;

        return <a
            type="button"
            ref={menuItemRef[index]}
            onMouseDown={(event) => onMouseClick(index, event)}
            onMouseEnter={() => moveSelector(index)}
            href={`#${text.toLocaleLowerCase()}`}
            className={cn(
                `flex items-center justify-center w-full px-0.5 py-6 hover:brightness-125`,
                {
                    "rounded-t-[1em]": isTop,
                    "rounded-b-[1em]": isBottom,
                    "brightness-125": index === activePage,
                    "brightness-75": index !== activePage
                })
            }
        >
            <p className={cn(
                `-translate-y-2`
            )
            }>
                {text.toUpperCase()}</p>
        </a>
    }

    const MenuContent = () => <>
        {pages.map<ReactNode>((item, i) => {
            return <MenuButton key={`${i}`} index={i} isTop={i == 0} isBottom={i == pages.length - 1} text={item} />
        }).reduce((prev, curr, i) => [prev, <Divider key={`divider-i`} />, curr])}
    </>

    return <div ref={menuRef}
        onMouseLeave={() => moveSelector(activePage)}
        className="flex group fixed bg-fill/10 rounded-[1em] flex-col items-center w-40 font-normal font-display text-lg my-auto -translate-x-full -translate-y-1/2 top-1/2 shadow-2xl py-2">
        <MenuContent />
        <MenuSelector/>
    </div>;
}

export default Menu;