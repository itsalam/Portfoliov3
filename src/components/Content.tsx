import { HTMLProps, ReactElement, ReactNode, isValidElement } from 'react';
import { cx } from '@vechaiui/react';
import Menu from './Menu';
import {
  isWideListener,
  isMobileListener,
  updateScrollProgress
} from '@src/etc/Helpers';
import "swiper/css";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, HashNavigation, Mousewheel, Pagination, Scrollbar } from "swiper";
import React from 'react';


function Content(props: HTMLProps<HTMLDivElement> & { children?: ReactNode }) {
  const isWide = isWideListener();
  const isMobile = isMobileListener();
  const { containerCallback } = updateScrollProgress();

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
          direction={"vertical"}
          slidesPerView={1}
          scrollbar={true}
          centeredSlides={true}
          touchStartPreventDefault={false}
          pagination={{
            clickable: true,
          }}
          modules={[Pagination, FreeMode, Scrollbar, Mousewheel, HashNavigation]} className="flex w-full flex-col gap-[20vh] px-4 ">
          {props.children && React.Children.map(props.children,
            (child: ReactElement) => isValidElement(child) ? <SwiperSlide>{child}</SwiperSlide> : null
          )}
        </Swiper>
      </div>
    </div>
  );
}

export default Content;
