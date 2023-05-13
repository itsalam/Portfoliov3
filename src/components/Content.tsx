import {
  HTMLProps,
  ReactElement,
  ReactNode,
  isValidElement,
  useEffect,
  useRef
} from 'react';
import { cx } from '@vechaiui/react';
import Menu from './Menu';
import {
  isWideListener,
  isMobileListener,
  updateScrollProgress
} from '@src/etc/Helpers';
import 'swiper/css';
import 'swiper/css/pagination';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import {
  FreeMode,
  HashNavigation,
  Keyboard,
  Mousewheel,
  Pagination,
  Scrollbar
} from 'swiper';
import React from 'react';
import useStore from '@src/store';

function Content(props: HTMLProps<HTMLDivElement> & { children?: ReactNode }) {
  const isWide = isWideListener();
  const isMobile = isMobileListener();
  const { containerCallback } = updateScrollProgress();

  const { activePage, pages, setProgress } = useStore.getState();

  const swiperRef = useRef<SwiperRef | null>(null);

  useEffect(() => {
    console.log(activePage);
    swiperRef.current?.swiper.slideTo(activePage, 750);
    setProgress(activePage / (pages.length - 1));
  }, [activePage]);

  return (
    <div
      className="z-10 flex items-start justify-center"
      ref={containerCallback}
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
          onSlideChangeTransitionEnd={(swiper) => {
            useStore.setState({ activePage: swiper.activeIndex });
          }}
          modules={[
            Pagination,
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
