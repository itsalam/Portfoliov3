import { isWideListener } from '@src/etc/Helpers';
import useStore from '@src/store';
import { cx } from '@vechaiui/react';
import { debounce } from 'lodash';
import React, { ReactNode, SVGProps, useEffect, useRef, useState } from 'react';

interface SelectorProps {
  radius: number;
  strokeWidth: number;
  progress: number;
}

function Selector(props: SelectorProps & SVGProps<SVGSVGElement>) {
  const { radius, strokeWidth, progress, ...otherProps } = props;
  const progCircleRef = useRef<SVGCircleElement>(null);

  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  useEffect(() => {
    if (progCircleRef.current) {
      setTimeout(() => {
        progCircleRef.current?.animate(
          { strokeDashoffset: circumference - progress * circumference },
          { duration: 400, fill: 'forwards', easing: 'ease-in' }
        );
      }, 250);
    }
  }, [progress]);

  return (
    <svg {...otherProps} height={radius * 2} width={radius * 2}>
      <circle
        stroke="currentColor"
        fill="transparent"
        strokeWidth={strokeWidth / 2}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={0}
        transform={`rotate(-90, ${radius}, ${radius})`}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        ref={progCircleRef}
      />
      <circle
        stroke="currentColor"
        fill="transparent"
        strokeWidth={strokeWidth / 2}
        strokeDasharray={`${circumference} ${circumference}`}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        opacity={0.2}
      />
      <circle
        fill="currentColor"
        r={normalizedRadius / 2}
        cx={radius}
        cy={radius}
      />
    </svg>
  );
}

const Divider = () => (
  <div
    className="bg-foreground invisible m-auto h-4 w-[2px] brightness-75 xl:visible"
  />
);

const RADIUS = 12;
const STROKE = 3;

function Menu(props: { vertical?: boolean; isToolBar?: boolean }) {
  let { vertical, isToolBar } = props;
  vertical = vertical ?? isWideListener(1280);
  isToolBar = isToolBar ?? false;
  const START = vertical ? 'top' : 'left';
  const END = vertical ? 'bottom' : 'right';

  const { pages, setActivePage } = useStore.getState();
  const { activePage } = useStore();

  const menuRef = useRef<HTMLDivElement>(null);
  const menuItemRef = pages.map(() => useRef<HTMLAnchorElement>(null));

  const [currCoords, setCurrCoords] = useState<number>();
  const [progress, setProgress] = useState<number>(
    activePage / (pages.length - 1)
  );
  const [firstLoad, setFirstLoad] = useState(true);

  const getMenuCoord = (index: number) => {
    const currMenuItem = menuItemRef[index].current;
    if (currMenuItem !== null) {
      const menuCoords = currMenuItem.getBoundingClientRect();
      const offset = menuRef.current?.getBoundingClientRect()[START] ?? 0;
      return (menuCoords[START] + menuCoords[END]) / 2 - RADIUS - offset;
    }
    return 0;
  };

  const moveSelector = debounce(
    (i: number) => {
      const moveVal = getMenuCoord(i);
      document.querySelector('#selector')?.animate(
        vertical
          ? {
            top: `${moveVal}px`,
          }
          : {
            left: `${moveVal}px`,
          },
        { duration: 250, fill: 'forwards', easing: 'ease-out' }
      );
    },
    150,
    { trailing: true }
  );

  useEffect(() => {
    const pageRef = menuItemRef[activePage];
    if (pageRef.current && !firstLoad) {
      if (window.location.hash !== pageRef.current.href.split('#')[1]) {
        history.pushState(null, '', pageRef.current.href);
      }
    } else {
      setFirstLoad(false);
    }
    moveSelector(activePage);

    setProgress(activePage / (pages.length - 1));
  }, [activePage, vertical]);

  useEffect(() => {
    moveSelector(activePage);
    setCurrCoords(getMenuCoord(activePage));
  }, [vertical]);

  const onItemClick = (
    index: number,
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    event.preventDefault();
    setActivePage(index);
    setCurrCoords(getMenuCoord(index));
  };

  const MenuButton = (props: { index: number; text: string }) => {
    const { index, text } = props;

    return (
      <a
        type="button"
        ref={menuItemRef[index]}
        onMouseDown={(event) => onItemClick(index, event)}
        onMouseEnter={() => moveSelector(index)}
        href={`#${text.toLocaleLowerCase()}`}
        className={cx(
          'flex items-center justify-center w-full px-1.5 hover:brightness-125 text-base sm:text-lg',
          {
            'brightness-125': index === activePage,
            'brightness-75': index !== activePage,
          },
          'sm:h-full'
        )}
      >
        <p className={cx('-translate-y-0.5')}>
          {text.toUpperCase()}
        </p>
      </a>
    );
  };

  const MenuContent = () => (
    <>
      {pages
        .map<ReactNode>((item, i) => <MenuButton key={`${i}`} index={i} text={item} />)
        .reduce((prev, curr) => [prev, <Divider key="divider-i" />, curr])}
    </>
  );

  return (
    <div
      ref={menuRef}
      onMouseLeave={() => moveSelector(activePage)}
      className={cx(
        'intro-revealer flex group flex-row items-center font-display my-auto z-50 muted-color',
        'xl:rounded-xl',

        'sticky flex-1'
      )}
    >
      <MenuContent />
      <Selector
        id="selector"
        progress={progress}
        strokeWidth={STROKE}
        radius={RADIUS}
        className={cx('absolute brightness-125 translate-y-5 mix-blend-screen')}
        style={currCoords !== undefined ? { [START]: `${currCoords}px` } : {}}
      />
    </div>
  );
}

export default Menu;
