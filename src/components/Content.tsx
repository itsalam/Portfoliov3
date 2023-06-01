import { isMobileListener, isWideListener } from '@src/etc/Helpers';
import useStore from '@src/store';
import { cx } from '@vechaiui/react';
import { useControls } from 'leva';
import { debounce } from 'lodash';
import React, {
  HTMLProps,
  ReactNode,
  WheelEventHandler,
  isValidElement,
  useEffect,
  useRef
} from 'react';
import {
  HashNavigation,
  Keyboard,
  Mousewheel,
  Scrollbar
} from 'swiper';
import 'swiper/css';
import 'swiper/css/pagination';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import Menu from './Menu';

function Content(props: HTMLProps<HTMLDivElement> & { children?: ReactNode }) {
  const isWide = isWideListener(1280);
  const isMobile = isMobileListener();

  const contentRef = useRef<HTMLDivElement>(null);

  const { activePage, pages } = useStore.getState();
  const { hideForeground } = useStore.getState();

  const swiperRef = useRef<SwiperRef | null>(null);

  const scrollContent: WheelEventHandler<HTMLDivElement> = debounce(
    (event) => {
      if (swiperRef.current) {
        const nextPage = activePage + (event.deltaY > 0 ? 1 : -1);
        if (nextPage < pages.length && nextPage >= 0) {
          useStore.setState({ activePage: nextPage });
        }
      }
    },
    250,
    { leading: true, trailing: false }
  );

  useEffect(() => {
    swiperRef.current?.swiper.slideTo(activePage, 750);
  }, [activePage]);

  useEffect(() => {
    if (contentRef.current) {
      if (!hideForeground)
        contentRef.current.style.setProperty('display', 'flex');
      const animate = contentRef.current.animate(
        { opacity: hideForeground ? 0 : 1 },
        { duration: 350, fill: 'forwards' }
      );
      if (hideForeground) {
        animate.onfinish = () => {
          contentRef.current?.style.setProperty(
            'display',
            hideForeground ? 'none' : 'flex'
          );
        };
      }
    }
  }, [hideForeground]);

  useControls({
    hideForeground: {
      value: false,
      label: 'Hide Content'
    }
  });

  return (
    <div
      className="z-10 flex items-start justify-center"
      ref={contentRef}
      style={{ display: 'none' }}
      onWheel={scrollContent}
    >
      <div
        className={cx(
          'flex gap-10  w-full transition-[width] max-w-screen-xl h-screen',
          'flex-col',
          'sm:w-11/12 xl:w-9/12 xl:px-10 2xl:w-7/12'
        )}
      >
        {(isWide || isMobile) && <Menu />}
        <Swiper
          onSwiper={(swiper) => (swiperRef.current = { swiper })}
          direction={'vertical'}
          slidesPerView={1}
          scrollbar={true}
          centeredSlides={true}
          keyboard={{
            enabled: true
          }}
          touchStartPreventDefault={false}
          onSlideChangeTransitionStart={(swiper) => {
            useStore.setState({ activePage: swiper.activeIndex });
          }}
          modules={[
            Keyboard,
            Scrollbar,
            Mousewheel,
            HashNavigation
          ]}
          className="flex w-full flex-col gap-[20vh] px-4 "
        >
          {props.children &&
            React.Children.map(props.children, (child) =>
              isValidElement(child) ? <SwiperSlide>{child}</SwiperSlide> : null
            )}
        </Swiper>
      </div>
    </div>
  );
}

export default Content;
