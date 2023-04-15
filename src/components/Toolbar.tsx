import { useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import useStore from '@src/store';
import anime from 'animejs';
import Menu from './Menu';
import { isMobileListener, isWideListener } from '@src/etc/helper';

function ThemeSwitch(props: { darkMode: boolean, setDarkMode: (arg: boolean) => void }) {
    const { darkMode, setDarkMode } = props;
    const toggleRef = useRef<HTMLDivElement>(null);

    const sunIcon = (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
        />
    );

    const moonIcon = (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
        />
    );

    const sunClasses = ['bg-primary-700', 'text-white'];
    const moonClasses = [
        'bg-primary-300/.5',
        'text-white-400',
        'translate-x-full'
    ];

    function toggleTheme() {
        setTimeout(() => {
            setDarkMode(!darkMode);
        }, 250);
        const currElem = toggleRef.current
        if (currElem) {
            currElem.classList.remove(
                ...(darkMode ? moonClasses : sunClasses)
            );
            currElem.classList.add(...(darkMode ? sunClasses : moonClasses));
        }
    }

    return (
        <button
            className={`flex h-7 w-12 items-center rounded-full p-1 shadow transition duration-150 focus:outline-none ${darkMode
                ? 'bg-slate-600/15 hover:bg-primary-300/20'
                : 'bg-slate-300/15 hover:bg-slate-300/40'
                }`}
            onClick={() => toggleTheme()}
        >
            <div
                ref={toggleRef}
                id="switch-toggle"
                className={
                    'w-5 h-5 relative rounded-full transition duration-500 transform p-0.5 ' +
                    (darkMode ? moonClasses : sunClasses).join(' ')
                }
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.25}
                    stroke="currentColor"
                    className="h-4 w-4"
                >
                    {darkMode ? moonIcon : sunIcon}
                </svg>
            </div>
        </button>
    );
}

function Toolbar(props: { darkMode: boolean, setDarkMode: (arg: boolean) => void }) {
    const { activePage, pages } = useStore();
    const [currPage, setCurrPage] = useState<number>();

    const animationVals = (isDownwards?: boolean) => [
        ['0%', `${isDownwards ? '' : '-'}100%`],
        [`${isDownwards ? '-' : ''}100%`, '0%']
    ];

    const isWide = isWideListener();
    const isMobile = isMobileListener();

    useEffect(() => {
        if (currPage === undefined) {
            setCurrPage(activePage);
            return;
        }
        anime({
            targets: `#toolbar .titleContent>div`,
            keyframes: [
                {
                    translateY: (_: Element, i: number) => {
                        return animationVals(activePage > currPage)[i];
                    },
                    duration: 650
                }
            ],
            easing: 'easeOutQuart',
            complete: () => {
                setCurrPage(activePage);
            }
        });
    }, [activePage]);

    return (
        <div
            className={cn("fixed z-20 flex w-full items-center justify-between space-x-4 rounded p-4", { "": !isWide && !isMobile })}
            id="toolbar"
        >
            <div className="text-foreground flex flex-1 pl-4 text-xl tracking-widest">
                Vincent Lam /
                <div className="revealer w-24">
                    <div className="titleContent w-24 whitespace-pre">
                        <div className="absolute"> {pages[currPage ?? 0]}</div>
                        <div className="absolute"> {pages[activePage]}</div>
                    </div>
                </div>
            </div>
            {!isWide && !isMobile && <Menu isToolBar />}
            <div className="flex ">
                <ThemeSwitch {...props} />
            </div>
        </div>
    );
}

export default Toolbar;
