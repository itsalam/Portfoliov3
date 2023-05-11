import { AnimeTimelineInstance } from 'animejs';
import { cx } from '@vechaiui/react';
import React, { HTMLProps, useCallback, useMemo } from 'react';
import { useEffect, useState } from 'react';
import useStore from '@src/store';
import { debounce } from 'lodash';
import { animateProject, animateProjectReverse } from './animations';
import { Project } from '@src/store/types';
import Carousel from './carousel';
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel, Pagination, Scrollbar } from "swiper";

import {
  pageRef,
  useScreenSize,
  isMobileListener,
  isWideListener
} from '@src/etc/Helpers';


export default function Projects(props: HTMLProps<HTMLDivElement>) {
  const [focusedProj, setFocusedProj] = useState<number>();
  const [focusedAni, setFocusedAni] = useState<AnimeTimelineInstance>();
  const [centeredElem, setCenteredElem] = useState<Element>();

  const { containerRef, containerCallback } = pageRef();

  const { width } = useScreenSize();
  const isMobile = isMobileListener();
  const isWide = isWideListener();

  const { projects } = useStore();
  const subProjects = new Array(5).fill(projects ? projects[0] : undefined);

  useEffect(() => {
    setFocusedProj(undefined);
    document
      .querySelectorAll('.project, .project *')
      ?.forEach((elem) => (elem as HTMLElement).setAttribute('style', ''));
  }, [isMobile, isWide]);

  useEffect(() => {
    document.querySelector('.centered')?.classList.toggle('centered', false);
    centeredElem?.classList.toggle('centered', true);
  }, [centeredElem]);

  useEffect(() => {
    if (focusedProj !== undefined) setFocusedAni(animateProject(focusedProj));
  }, [focusedProj]);

  const positionCarousel = useCallback(() => {
    const rect = containerRef.current?.getBoundingClientRect();
    return rect ? { left: `${(rect.right + window.innerWidth) / 2}px` } : {};
  }, [containerRef, width]);

  const onProjectClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    i: number
  ) => {
    const lastFocusedElem = document.querySelector('.focused');
    const elem = e.currentTarget.parentNode as Element;
    lastFocusedElem?.classList.toggle('focused', false);
    elem.classList.toggle('focused', i !== focusedProj);
    if (focusedProj !== undefined) {
      focusedAni?.pause();
      animateProjectReverse(focusedProj);
    }
    setFocusedProj(i === focusedProj ? undefined : i);
  };

  const renderProjects = (project: Project, i: number) => (
    <SwiperSlide
      key={`p-${i}`}
      className='flex items-center justify-center'
    >
      <div className={cx(
        'snap-center transition md:h-[40vh] md:min-h-[20rem] project rounded-md shadow-md flex hover:bg-base/60 bg-base/30 hover:opacity-100 ',
        'w-full md:w-2/3',
        'flex-col md:flex-row',
        { right: i % 2 === 0, left: i % 2 === 1, mobile: isMobile }
      )}>
        <img
          onClick={(e) => onProjectClick(e, i)}
          src={`https://source.unsplash.com/featured/800x1600sig=${i}`}
          className={cx(
            'cursor-pointer md:w-1/4 object-cover object-center z-10',
            'md:min-w-[14rem]',
            'w-full h-80 md:h-auto',
            { 'md:rounded-l-md': i % 2 === 0, 'md:rounded-r-md': i % 2 === 1 }
          )}
        />
        <div
          onClick={(e) => onProjectClick(e, i)}
          className={cx(
            'cursor-pointer flex flex-col p-4 justify-center items-center md:w-3/4 md:h-auto h-32',
            {
              'md:items-end md:text-end md:left-0': i % 2 === 0,
              'md:items-start md:right-0': i % 2 === 1
            }
          )}
        >
          <div className="revealer shrink-0 ">
            <h1 className="subTitle">{project.name}</h1>
          </div>
          <div className="revealer shrink-0">
            <p className="subText description">{project.description}</p>
          </div>
          <div className="bg-foreground my-3 h-[1px] w-full" />
          <div className="revealer fullDescription shrink-1 h-0 overflow-y-scroll opacity-0">
            <div className="subText absolute ">
              <p>{project.fullDescription}</p>
            </div>
          </div>
        </div>
      </div>
      <Carousel
        style={positionCarousel()}
        visible={isWide && i === focusedProj}
      />
    </SwiperSlide>
  );

  return (
    <div
      className="projectTrack relative flex h-screen w-full grow flex-col items-center justify-start overflow-y-scroll py-16 md:gap-20 md:py-[10vh]"
      ref={containerCallback}
      id="projects"
      {...props}
    >
      <h1 className="title relative left-0 flex w-full items-center gap-4">
        Projects
        <div className="bg-foreground relative top-1/4 h-[2px] w-1/3" />
      </h1>
      <Swiper
        direction={"vertical"}
        mousewheel={true}
        scrollbar={true}
        centeredSlides
        slidesPerView={1}
        nested={true}
        spaceBetween={30}
        pagination={{
          clickable: true,
        }}

        onSlideChangeTransitionEnd={(swiper) => { setCenteredElem(swiper.slides[swiper.activeIndex].firstChild as HTMLElement) }}
        modules={[Pagination, FreeMode, Scrollbar, Mousewheel]} className='h-auto w-full'>
        {subProjects.map(renderProjects)}
      </Swiper>
    </div >
  );
}
