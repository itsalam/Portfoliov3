import cn from 'classnames';
import anime from 'animejs';
import { debounce } from 'lodash';
import useStore from '@src/store';
import {
    ReactNode,
    useRef,
    useState,
    useEffect,
    useCallback,
    SVGProps
} from 'react';
import React from 'react';
import { isWideListener } from '@src/etc/helper';

interface SelectorProps {
    radius: number,
    strokeWidth: number,
    progress: number,
}

function Selector(props: SelectorProps & SVGProps<SVGSVGElement>) {
    const { radius, strokeWidth, progress, ...otherProps } = props;

    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const svgProperties = {
        normalizedRadius: radius - strokeWidth * 2,
        circumference: normalizedRadius * 2 * Math.PI,
        strokeDashoffset: circumference - progress * circumference,
    };

    useEffect(() => {
        anime({
            targets: svgProperties,
            strokeDashoffset: circumference - progress * circumference,
            round: 1,
            easing: 'easeOutQuad',
        });
    }, [progress])

    return (
        <svg {...otherProps} height={radius * 2} width={radius * 2}>
            <circle
                stroke={'currentColor'}
                fill="transparent"
                strokeWidth={strokeWidth / 2}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset: svgProperties.strokeDashoffset }}
                transform={`rotate(-90, ${radius}, ${radius})`}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />
            <circle
                stroke={'currentColor'}
                fill="transparent"
                strokeWidth={strokeWidth / 2}
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
const STROKE = 3;

function Menu({ vertical = isWideListener(), isToolBar = false }) {
    const START = vertical ? 'top' : 'left';
    const END = vertical ? 'bottom' : 'right';

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
                strokeWidth={STROKE}
                radius={RADIUS}
                className={cn(`absolute brightness-125 translate-y-4 xl:translate-y-3`)}
                style={currCoords !== undefined ? { [START]: `${currCoords}px` } : {}}
            />
        ),
        [progress]
    );

    const getMenuCoord = (index: number) => {
        const currMenuItem = menuItemRef[index].current
        if (currMenuItem !== null) {
            const menuCoords = currMenuItem.getBoundingClientRect();
            const offset = menuRef.current?.getBoundingClientRect()[START] ?? 0;
            return (menuCoords[START] + menuCoords[END]) / 2 - RADIUS - offset;
        } else {
            return 0;
        }
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
                    setSelectorMoving(false);
                    setCurrCoords(moveVal);
                    if (fromScroll && currCoords) {
                        setProgress(currCoords < moveVal ? 0 : 100);
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
        <div className={'bg-foreground invisible m-auto h-4 w-[2px] brightness-75 lg:visible'} />
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
        const { index, text } = props;

        return (
            <a
                type="button"
                ref={menuItemRef[index]}
                onMouseDown={(event) => onMouseClick(index, event)}
                onMouseEnter={() => moveSelector(index)}
                href={`#${text.toLocaleLowerCase()}`}
                className={cn(
                    `flex items-center justify-center w-full px-0.5 hover:brightness-125 text-base sm:text-lg`,
                    {
                        'brightness-125': index === activePage,
                        'brightness-75': index !== activePage,
                        "py-3": !isToolBar,
                        "": isToolBar
                    },
                    "xl:py-6 sm:h-full"
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
                .reduce((prev, curr) => [prev, <Divider key={`divider-i`} />, curr])}
        </>
    );

    return (
        <div
            ref={menuRef}
            onMouseLeave={() => moveSelector(activePage)}
            className={cn(
                "flex group flex-row  items-center font-display my-auto  py-2 z-50",
                "xl:rounded-xl xl:flex-col xl:-translate-x-full xl:-translate-y-1/2 xl:top-1/2 xl:w-40 xl:bottom-auto xl:left-auto xl:right-auto",
                {
                    "fixed bg-fill/10 left-0 bottom-0 m-auto right-0 flex-shrink-1 w-full -translate-y-1/4 shadow-2xl": !isToolBar,
                    "sticky flex-1": isToolBar
                }
            )}
        >
            <MenuContent />
            <MenuSelector />
        </div>
    );
}

export default Menu;