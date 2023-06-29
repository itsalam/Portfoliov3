import useStore from '@src/store';
import { Project } from '@src/store/types';
import { AnimeTimelineInstance } from 'animejs';
import React, {
  HTMLProps,
  WheelEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import { FreeMode, Mousewheel, Pagination, Scrollbar } from 'swiper';
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react';
import { animateProject, animateProjectReverse } from './animations';

import { isMobileListener, isWideListener } from '@src/etc/Helpers';
import { debounce } from 'lodash';
import ProjectContent from './components/ProjectSlide';

export default function Projects(props: HTMLProps<HTMLDivElement>) {
  const [focusedProj, setFocusedProj] = useState<number>();
  const [focusedAni, setFocusedAni] = useState<AnimeTimelineInstance>();
  const [centeredElem, setCenteredElem] = useState<Element>();

  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const isMobile = isMobileListener();
  const isWide = isWideListener();

  const { project, getSrc } = useStore.getState();
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
    project && animateProgress(1 / project.length);
  }, []);

  useEffect(() => {
    const firstProj = document.querySelector('.project');
    firstProj && setCenteredElem(firstProj);
  }, [project]);

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

  const renderProjects = (project: Project, i: number) => (
    <SwiperSlide key={`p-${i}`} className="flex items-center justify-center">
      <ProjectContent
        project={project}
        index={i}
        onClick={onProjectClick(i)}
        imgSrc={getSrc ? getSrc(project.thumbnails[0]) : ''}
      />
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
        {project?.map(renderProjects)}
      </Swiper>
    </div>
  );
}
