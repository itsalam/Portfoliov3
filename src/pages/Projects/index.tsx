import { AnimeTimelineInstance } from 'animejs';
import { cx } from '@vechaiui/react';
import React, {
  HTMLProps,
  WheelEventHandler,
  useCallback,
  useRef
} from 'react';
import { useEffect, useState } from 'react';
import useStore from '@src/store';
import Link from '@src/assets/link.svg';
import Github from '@src/assets/github.svg';
import { animateProject, animateProjectReverse } from './animations';
import { Project } from '@src/store/types';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import { FreeMode, Mousewheel, Pagination, Scrollbar } from 'swiper';

import {
  handleScroll,
  isMobileListener,
  isWideListener
} from '@src/etc/Helpers';
import { debounce } from 'lodash';

export default function Projects(props: HTMLProps<HTMLDivElement>) {
  const [focusedProj, setFocusedProj] = useState<number>();
  const [focusedAni, setFocusedAni] = useState<AnimeTimelineInstance>();
  const [centeredElem, setCenteredElem] = useState<Element>();

  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const isMobile = isMobileListener();
  const isWide = isWideListener();

  const { projects, imageBuilder } = useStore.getState();
  const { activePage } = useStore();

  const swiperRef = useRef<SwiperRef | null>(null);

  const scrollContent: WheelEventHandler<HTMLDivElement> = debounce(
    (event) => {
      if (swiperRef.current) {
        const swiper = swiperRef.current.swiper;
        const nextPage = swiper.activeIndex + (event.deltaY > 0 ? 1 : -1);
        if (nextPage < swiper.slides.length && nextPage >= 0) {
          swiper.slideTo(nextPage, 750);
          event.stopPropagation();
        }
      }
    },
    250,
    { leading: true, trailing: false }
  );

  useEffect(() => {
    projects && animateProgress(1 / projects.length);
  }, []);

  useEffect(() => {
    const firstProj = document.querySelector('.project');
    firstProj && setCenteredElem(firstProj);
  }, [projects]);

  useEffect(() => {
    setFocusedProj(undefined);
    document
      .querySelectorAll('.project, .project *')
      ?.forEach((elem) => (elem as HTMLElement).setAttribute('style', ''));
  }, [isMobile, isWide]);

  useEffect(() => {
    document.querySelector('.centered')?.classList.toggle('centered', false);
    centeredElem?.classList.toggle('centered', true);
  }, [centeredElem, activePage]);

  useEffect(() => {
    if (focusedProj !== undefined) setFocusedAni(animateProject(focusedProj));
  }, [focusedProj]);

  const animateProgress = useCallback(
    (progress: number) =>
      progressBarRef.current?.animate(
        { width: `${progress * 100}%` },
        { duration: 150, fill: 'forwards', easing: 'ease-in-out' }
      ),
    []
  );

  const onProjectClick =
    (i: number) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      const lastFocusedElem = document.querySelector('.focused');
      const elem = e.currentTarget as Element;
      lastFocusedElem?.classList.toggle('focused', false);
      elem.classList.toggle('focused', i !== focusedProj);
      if (focusedProj !== undefined) {
        focusedAni?.pause();
        animateProjectReverse(focusedProj);
      }
      setFocusedProj(i === focusedProj ? undefined : i);
    };

  const LinkHref = useCallback((props: { dataSrc: string; href: string }) => {
    const onAnchorClick = (
      e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
    ) => {
      e.stopPropagation(); //
    };

    return (
      <a
        className="hover:bg-foreground/10 h-7 w-7 rounded-sm"
        href={props.href}
        onClick={onAnchorClick}
      >
        <svg fill="currentColor" data-src={props.dataSrc}></svg>
      </a>
    );
  }, []);

  const renderProjects = (project: Project, i: number) => (
    <SwiperSlide key={`p-${i}`} className="flex items-center justify-center">
      <div
        onClick={onProjectClick(i)}
        className={cx(
          'transition project rounded-md shadow-md flex hover:bg-base/80 bg-base/30 md:h-3/6',
          'w-full md:w-2/3',
          'flex-col md:flex-row',
          { right: i % 2 === 0, left: i % 2 === 1, mobile: isMobile }
        )}
      >
        <img
          src={imageBuilder?.image(project.thumbnails[0]).url()}
          className={cx(
            'cursor-pointer md:w-1/4 object-cover object-center z-10',
            'w-full h-60 md:h-auto rounded-t-md',
            { 'md:rounded-r-md': i % 2 === 0, 'md:rounded-l-md': i % 2 === 1 }
          )}
        />
        <div
          className={cx(
            'cursor-pointer flex flex-col p-4 justify-center md:w-3/4 h-full',
            {
              'md:items-end md:text-end md:left-0': i % 2 === 0,
              'md:items-start md:right-0': i % 2 === 1
            }
          )}
        >
          <div className="revealer flex shrink-0 justify-between md:flex-col">
            <h1 className="subTitle whitespace-no-wrap shrink-0">
              {project.name}
            </h1>
            <div className="revealer w-auto">
              <div
                className={cx('links flex', {
                  'md:flex-row-reverse': i % 2 === 0
                })}
              >
                <LinkHref dataSrc={Link} href={project.link} />
                <LinkHref dataSrc={Github} href={project.githublink} />
              </div>
            </div>
          </div>
          <div className="revealer shrink-0">
            <p className="subText description">{project.description}</p>
          </div>
          <div className="bg-foreground my-3 h-[1px] w-full" />
          <div
            className="revealer fullDescription shrink-1 h-0 overflow-y-scroll opacity-0"
            onWheel={handleScroll}
          >
            <div className="subText absolute">
              <p>{project.fullDescription}</p>
            </div>
          </div>
        </div>
      </div>
    </SwiperSlide>
  );

  return (
    <div
      className="projectTrack flex h-full w-full flex-col py-16 md:py-[10vh]"
      ref={containerRef}
      id="projects"
      onWheel={scrollContent}
      {...props}
    >
      <h1 className="title relative left-0 flex w-full items-center gap-4">
        Projects
        <div className="bg-foreground/20 relative top-1/4 h-[2px] w-1/3">
          <div className="bg-foreground h-full w-full" ref={progressBarRef} />
        </div>
      </h1>
      <Swiper
        centeredSlides
        nested
        direction={'vertical'}
        slidesPerView={1}
        onSlideChange={(swiper) => {
          const progress = (swiper.activeIndex + 1) / swiper.slides.length;
          animateProgress(progress);
        }}
        onSlideChangeTransitionEnd={(swiper) => {
          setCenteredElem(
            swiper.slides[swiper.activeIndex].firstChild as HTMLElement
          );
        }}
        modules={[Scrollbar, Pagination, FreeMode, Scrollbar, Mousewheel]}
        className="h-auto w-full"
        ref={swiperRef}
      >
        {projects?.map(renderProjects)}
      </Swiper>
    </div>
  );
}
