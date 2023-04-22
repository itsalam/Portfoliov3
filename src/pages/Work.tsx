/* eslint-disable tailwindcss/no-custom-classname */
import useStore from '@src/store';
import { Work } from '@src/store/types';
import { HTMLProps, useState } from 'react';
import { Tab } from '@headlessui/react';
import { cx } from '@vechaiui/react';
import { pageRef } from '../etc/helper';
import anime, { AnimeParams } from 'animejs';

const convertDate = (date: string) => {
  return new Date(date).toLocaleDateString('default', {
    month: 'long',
    year: 'numeric'
  });
};

export default function Works(props: HTMLProps<HTMLDivElement>) {
  const [activeWork, setActiveWork] = useState<number>(0);

  const { containerCallback } = pageRef();

  const { works } = useStore();

  const tabAnimation = (configs: AnimeParams) =>
    anime({
      targets: `.tabPanel`,
      opacity: [1, 0],
      easing: 'linear',
      duration: 250,
      ...configs
    });

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

  const renderWork = (work: Work) => {
    return (
      <Tab.Panel
        className="mainText flex w-full flex-col gap-8 transition-all "
        key={work.companyName}
      >
        {work.experiences.map((experience, i) => (
          <div className="flex flex-col gap-3 xl:px-4" key={i}>
            <h1 className="subTitle text-muted whitespace-pre-wrap sm:whitespace-nowrap">
              <span>{experience.title}<span className="text-foreground">{"\n @ "}{work.companyName}</span></span>
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
      className="bg-base/10 relative h-[150vh] xl:mt-40"
      id="work"
      {...props}
      ref={containerCallback}
    >
      <Tab.Group
        as="div"
        className="sticky top-[10%] flex h-[75vh] flex-col gap-5 px-4 xl:top-[15%]"
        selectedIndex={activeWork}
        onChange={handleTabChange}
      >
        <h1 className="title relative left-0 flex w-full items-center gap-10">
          Work
          <div className="bg-foreground h-[2px] w-1/3" />
        </h1>
        {works && <>
          <Tab.List className={cx('flex subText font-works gap-1')}>
            {works.map((work) => (
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
        </>}
      </Tab.Group>
    </div>
  );
}
