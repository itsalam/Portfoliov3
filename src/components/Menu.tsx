import cn from 'classnames';
import anime from 'animejs';
import { debounce, now } from 'lodash';
import useStore from '@src/store';
import {
    ReactNode,
    useRef,
    useState,
    useEffect,
    memo,
    forwardRef,
    useMemo,
    useCallback
} from 'react';
import React from 'react';

function Selector(props) {
    const { radius, stroke, progress, innerRef, ...otherProps } = props;

    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - progress * circumference;
    return (
        <svg ref={innerRef} {...otherProps} height={radius * 2} width={radius * 2}>
            <circle
                stroke={'currentColor'}
                fill="transparent"
                strokeWidth={stroke / 2}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                transform={`rotate(-90, ${radius}, ${radius})`}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
            <circle
                stroke={'currentColor'}
                fill="transparent"
                strokeWidth={stroke / 2}
                strokeDasharray={circumference + ' ' + circumference}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                opacity={0.2}
            />
            <circle
                fill={'currentColor'}
                r={normalizedRadius / 2}
                cx={radius}
                cy={radius}
            />
        </svg>
    );
}

const RADIUS = 12;

function Menu({ vertical = window.innerWidth > 1280 }) {
    const START = vertical ? 'top' : 'left';
    const END = vertical ? 'bottom' : 'right';
    const SIZE = vertical ? 'height' : 'width';

    const storeProgress = useStore().progress;
    const [progress, setProgress] = useState(0);
    const [selectorMoving, setSelectorMoving] = useState(false);
    const { activePage, pages, setActivePage } = useStore.getState();

    const menuRef = useRef<HTMLDivElement>(null);
    const menuItemRef = pages.map(() => useRef<HTMLAnchorElement>(null));

    const [currCoords, setCurrCoords] = useState<number>();

    const MenuSelector = useCallback(
        () => (
            <Selector
                id="selector"
                progress={progress}
                stroke={3}
                radius={RADIUS}
                className={cn(`absolute brightness-125 xl:translate-y-3 translate-y-4`)}
                style={currCoords !== undefined ? { [START]: `${currCoords}px` } : {}}
            />
        ),
        [progress]
    );

    const getMenuCoord = (index: number) => {
        if (!menuItemRef[index]?.current) {
            return 0;
        }
        const menuCoords = menuItemRef[index]?.current?.getBoundingClientRect();
        const offset = menuRef.current?.getBoundingClientRect()[START] ?? 0;
        return (menuCoords[START] + menuCoords[END]) / 2 - RADIUS - offset;
    };

    const moveSelector = debounce(
        (i: number, fromScroll?: boolean) => {
            const moveVal = getMenuCoord(i);
            setSelectorMoving(true);
            return anime({
                targets: '#selector',
                [START]: moveVal,
                duration: 350,
                easing: 'easeOutQuart',
                complete: () => {
                    const oldCoord = currCoords;
                    setSelectorMoving(false);
                    setCurrCoords(moveVal);
                    if (fromScroll) {
                        setProgress(oldCoord < currCoords ? 0 : 100);
                    }
                }
            });
        },
        150,
        { leading: true }
    );

    useEffect(() => {
        if (!selectorMoving) {

            setProgress(storeProgress);
        }
    }, [storeProgress]);

    useEffect(() => {
        moveSelector(activePage, true);
    }, [activePage]);

    useEffect(() => {
        setCurrCoords(getMenuCoord(activePage));
    }, []);

    const Divider = () => (
        <div className={'sm:visible invisible w-[2px] h-4 bg-foreground m-auto brightness-75'} />
    );

    const onMouseClick = (
        index: number,
        event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
    ) => {
        event.preventDefault();
        setActivePage(index);
        setCurrCoords(getMenuCoord(index));
        window.location.assign(event.currentTarget.href);
    };

    const MenuButton = (props: {
        index: number;
        isTop: boolean;
        isBottom: boolean;
        text: string;
    }) => {
        const { index, isTop, isBottom, text } = props;

        return (
            <a
                type="button"
                ref={menuItemRef[index]}
                onMouseDown={(event) => onMouseClick(index, event)}
                onMouseEnter={() => moveSelector(index)}
                href={`#${text.toLocaleLowerCase()}`}
                className={cn(
                    `flex items-center justify-center w-full px-0.5 py-3 hover:brightness-125 text-base sm:text-lg`,
                    {
                        'rounded-t-[1em]': isTop,
                        'rounded-b-[1em]': isBottom,
                        'brightness-125': index === activePage,
                        'brightness-75': index !== activePage
                    },
                    "xl:py-6"
                )}
            >
                <p className={cn(`xl:-translate-y-2 -translate-y-0.5`)}>{text.toUpperCase()}</p>
            </a>
        );
    };

    const MenuContent = () => (
        <>
            {pages
                .map<ReactNode>((item, i) => {
                    return (
                        <MenuButton
                            key={`${i}`}
                            index={i}
                            isTop={i == 0}
                            isBottom={i == pages.length - 1}
                            text={item}
                        />
                    );
                })
                .reduce((prev, curr, i) => [prev, <Divider key={`divider-i`} />, curr])}
        </>
    );

    return (
        <div
            ref={menuRef}
            onMouseLeave={() => moveSelector(activePage)}
            className={cn(
                "flex group fixed bg-fill/20  items-center w-40 font-normal font-display text-lg my-auto shadow-2xl py-2 z-50",
                "flex-row bottom-0 w-full m-auto left-0 right-0 -translate-y-1/4 ",
                "sm:w-2/3 sm:rounded-xl ",
                "xl:flex-col xl:-translate-x-full xl:-translate-y-1/2 xl:top-1/2 xl:w-40 xl:bottom-auto xl:left-auto xl:right-auto"
            )}
        >
            <MenuContent />
            <MenuSelector />
        </div>
    );
}

export default Menu;
