import useStore from '@src/store';
import { useCallback, useEffect, useState } from 'react';
import cn from 'classnames';
import { Tab } from '@headlessui/react';
import { cx } from '@vechaiui/react';
import { pageRef, updateScrollProgress } from '../etc/helper';
import anime, { AnimeParams } from 'animejs';
import { debounce } from 'lodash';

const convertDate = (date: string) => {
  return new Date(date).toLocaleDateString('default', {
    month: 'long',
    year: 'numeric'
  });
};

const handleProgressChange = debounce(
  (index, activeWork, callback) => {
    if (index !== activeWork) {
      callback();
    }
  },
  50,
  { leading: true }
);

export default function Work(props: HTMLProps<HTMLDivElement>) {
  const [activeWork, setActiveWork] = useState<number>(0);

  const { containerRef: intersectRef, containerCallback: intersectCallback } =
    pageRef();
  const { containerRef, containerCallback } = updateScrollProgress(
    intersectRef,
    intersectCallback
  );
  const { works, activePage, pages, progress } = useStore();

  const THRESHOLD = 1 / works.length;

  const tabAnimation = (configs: AnimeParams) =>
    anime({
      targets: `.tabPanel`,
      opacity: [1, 0],
      easing: 'linear',
      duration: 250,
      ...configs
    });

  useEffect(() => {
    if (pages[activePage] === 'Work') {
      const index = Math.floor(progress / THRESHOLD);
      handleProgressChange(index, activeWork, () => setActiveWork(index));
    }
  }, [progress]);

  const handleTabChange = (index: number) => {
    tabAnimation({
      complete: () => {
        setActiveWork(index);
        setTimeout(() => {
          tabAnimation({
            opacity: [0, 1]
          });
        }, 200);
      }
    });
  };

  const renderWork = (work) => {
    return (
      <Tab.Panel
        className="w-full flex flex-col gap-8 mainText transition-all "
        key={work.companyName}
        value={work.companyName}
      >
        {work.experiences.map((experience, i) => (
          <div className="flex flex-col gap-3 xl:px-4" key={i}>
            <h1 className="subTitle text-muted">
              <span>{experience.title}</span><br />
              <span className="text-foreground"> @ {work.companyName}</span>
            </h1>
            <p className="mainText text-muted">
              {convertDate(experience.from)} - {convertDate(experience.to)}
            </p>
            <div className="subText w-full xl:px-4">
              {experience.descriptions.map((desc, j) => (
                <p className="w-full" key={`exp${i}-${j}`}>
                  {' '}
                  · {desc}
                </p>
              ))}
            </div>
          </div>
        ))
        }
      </Tab.Panel >
    );
  };

  return (
    <div
      className="h-[300vh] bg-base/10 relative xl:mt-40"
      id="work"
      {...props}
      ref={containerCallback}
    >
      <Tab.Group
        as="div"
        className="sticky h-[75vh] flex flex-col gap-5 px-4 xl:top-[15%] top-[10%]"
        selectedIndex={activeWork}
        onChange={handleTabChange}
      >
        <h1 className="title relative left-0 w-full flex items-center gap-10">
          Work
          <div className="h-[2px] w-1/3 bg-foreground" />
        </h1>
        <Tab.List className={cx('flex subText font-works gap-1')}>
          {works.map((work, i) => (
            <Tab
              key={work.companyName}
              value={work.companyName}
              className={cx(
                'xl:px-12 xl:py-4 p-4 hover:border-foreground hover:brightness-100 border-2 transition-all border-transparent brightness-75',
                'selected:border-foreground selected:bg-fill/30 selected:brightness-110'
              )}
            >
              {work.companyName}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="tabPanel flex-1 overflow-y-auto">
          {works.map((work) => renderWork(work))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
