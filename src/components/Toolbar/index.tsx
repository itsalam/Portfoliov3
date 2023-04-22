import { useEffect, useState } from 'react';
import useStore from '@src/store';
import anime from 'animejs';
import Menu from '../Menu';
import { isMobileListener, isWideListener } from '@src/etc/helper';
import ThemeSwitch from './ThemeSwitch';
import SettingsButton from './SettingsButton';

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
            className={"intro-revealer fixed z-20 flex w-full items-center justify-between space-x-4 rounded p-4"}
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
            <div className="flex gap-4">
                {!isWide && !isMobile && <Menu isToolBar />}
                {isMobile ?
                    <ThemeSwitch darkMode={props.darkMode} setDarkMode={props.setDarkMode} />
                    :
                    <SettingsButton darkMode={props.darkMode} setDarkMode={props.setDarkMode} />}
            </div>
        </div>
    );
}

export default Toolbar;
