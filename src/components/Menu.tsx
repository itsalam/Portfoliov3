import { cx } from "@vechaiui/react";
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
import { isWideListener } from "@src/etc/Helpers";

interface SelectorProps {
    radius: number,
    strokeWidth: number,
}

function Selector(props: SelectorProps & SVGProps<SVGSVGElement>) {
    const { radius, strokeWidth, ...otherProps } = props;
    const { progress } = useStore();
    const progCircleRef = useRef<SVGCircleElement>(null);

    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    useEffect(() => {
        if (progCircleRef.current) {
            progCircleRef.current.animate(
                { strokeDashoffset: circumference - progress * circumference },
                { duration: 400, fill: "forwards", easing: 'ease-in' });
        }
    }, [progress])

    return (
        <svg {...otherProps} height={radius * 2} width={radius * 2}>
            <circle
                stroke={'currentColor'}
                fill="transparent"
                strokeWidth={strokeWidth / 2}
                strokeDasharray={circumference + ' ' + circumference}
                strokeDashoffset={0}
                transform={`rotate(-90, ${radius}, ${radius})`}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                ref={progCircleRef}
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

    const { activePage, pages, setActivePage } = useStore.getState();

    const menuRef = useRef<HTMLDivElement>(null);
    const menuItemRef = pages.map(() => useRef<HTMLAnchorElement>(null));

    const [currCoords, setCurrCoords] = useState<number>();

    const MenuSelector = useCallback(
        () => (
            <Selector
                id="selector"
                strokeWidth={STROKE}
                radius={RADIUS}
                className={cx(`absolute brightness-125 translate-y-4 xl:translate-y-3`)}
                style={currCoords !== undefined ? { [START]: `${currCoords}px` } : {}}
            />
        ),
        []
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
        (i: number) => {
            const moveVal = getMenuCoord(i);
            document.querySelector('#selector')?.animate(vertical ? {
                top: `${moveVal}px`
            } : {
                left: `${moveVal}px`
            }, { duration: 250, fill: "forwards", easing: "ease-out" })
        },
        150,
        { leading: true }
    );


    useEffect(() => {
        moveSelector(activePage);
        const pageRef = menuItemRef[activePage];
        if (activePage && pageRef.current) {
            if (window.location.hash !== pageRef.current.href.split('#')[1]) {
                history.pushState(null, "", pageRef.current.href)
            }
        }
    }, [activePage]);

    useEffect(() => {
        moveSelector(activePage);
        setCurrCoords(getMenuCoord(activePage));
    }, [vertical]);

    const Divider = () => (
        <div className={'bg-foreground invisible m-auto h-4 w-[2px] brightness-75 xl:visible'} />
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
                className={cx(
                    `flex items-center justify-center w-full px-1.5 hover:brightness-125 text-base sm:text-lg`,
                    {
                        'brightness-125': index === activePage,
                        'brightness-75': index !== activePage,
                        "py-3": !isToolBar,
                        "": isToolBar
                    },
                    "xl:py-6 sm:h-full"
                )}
            >
                <p className={cx(`xl:-translate-y-2 -translate-y-0.5`)}>{text.toUpperCase()}</p>
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
            className={cx(
                "intro-revealer flex group flex-row  items-center font-display my-auto py-2 z-50",
                "xl:rounded-xl xl:flex-col xl:-translate-x-full xl:-translate-y-1/2 xl:top-1/2 xl:w-40 xl:bottom-auto xl:left-auto xl:right-auto",
                {
                    "fixed bg-base/50 left-0 bottom-0 m-auto right-0 flex-shrink-1 w-full -translate-y-1/4 shadow-2xl": !isToolBar,
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
