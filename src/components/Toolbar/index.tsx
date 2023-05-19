import { useEffect, useState } from 'react';
import useStore from '@src/store';
import Menu from '../Menu';
import ThemeSwitch from './ThemeSwitch';
import Settings from './Settings';
import { isWideListener, isMobileListener } from '@src/etc/Helpers';

function Toolbar(props: {
  darkMode: boolean;
  setDarkMode: (arg: boolean) => void;
}) {
  const { activePage, pages } = useStore();
  const [currPage, setCurrPage] = useState<number>();

  const animationVals = (isDownwards?: boolean) => [
    ['0%', `${isDownwards ? '' : '-'}100%`],
    [`${isDownwards ? '-' : ''}100%`, '0%']
  ];

  const isWide = isWideListener(1280);
  const isMobile = isMobileListener();

  useEffect(() => {
    if (currPage === undefined) {
      setCurrPage(activePage);
      return;
    }
    document
      .querySelectorAll(`#toolbar .titleContent>div`)
      ?.forEach((element: Element, i: number) => {
        const animation = element.animate(
          {
            transform: animationVals(activePage > currPage)[i].map(
              (val: string) => `translateY(${val})`
            )
          },
          { duration: 450, fill: 'forwards', easing: 'ease-out' }
        );
        animation.onfinish = () => setCurrPage(activePage);
      });
  }, [activePage]);

  return (
    <div
      className={
        'intro-revealer bg-foreground/10 fixed z-20 flex w-full items-center justify-between space-x-4 rounded p-4 md:bg-transparent'
      }
      id="toolbar"
    >
      <div className="text-foreground flex flex-1 whitespace-pre text-xl tracking-widest md:pl-4">
        Vincent Lam /
        <div className="revealer w-24">
          <div className="titleContent whitespace-pre md:w-24">
            <div className="absolute"> {pages[currPage ?? 0]}</div>
            <div className="absolute"> {pages[activePage]}</div>
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        {!isMobile && !isWide && <Menu isToolBar vertical={false} />}
        {!isWide && (
          <ThemeSwitch
            darkMode={props.darkMode}
            setDarkMode={props.setDarkMode}
          />
        )}
        <Settings
          darkMode={props.darkMode}
          setDarkMode={props.setDarkMode}
          hideThemeSwitch={!isWide}
        />
      </div>
    </div>
  );
}

export default Toolbar;
