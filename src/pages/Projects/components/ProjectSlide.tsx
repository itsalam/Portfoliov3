import Github from '@src/assets/github.svg';
import Link from '@src/assets/link.svg';
import { handleScroll, isMobileListener } from '@src/etc/Helpers';
import { Project } from '@src/store/types';
import { cx } from '@vechaiui/react';
import { HTMLProps, useCallback } from 'react';
import LinkHref from './HrefLink';

const ProjectSlide = (
  props: HTMLProps<HTMLDivElement> & {
    imgSrc: string;
    index: number;
    project: Project;
  }
) => {
  const { imgSrc, index: i, project } = props;
  const isMobile = isMobileListener();

  const Links = useCallback(
    () => (
      <>
        <LinkHref dataSrc={Link} href={project.link} />
        <LinkHref dataSrc={Github} href={project.githublink} />
      </>
    ),
    []
  );

  return (
    <div
      onClick={props.onClick}
      className={cx(
        'transition project rounded-md shadow-md flex hover:brightness-110 bg-base/70 h-2/3 md:h-3/6',
        'w-full md:w-2/3',
        'flex-col md:flex-row',
        { right: i % 2 === 0, left: i % 2 === 1, mobile: isMobile },
        props.className
      )}
    >
      <img
        src={imgSrc}
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
              <Links />
            </div>
          </div>
        </div>
        <div className="revealer shrink-0">
          <p className="subText description">{project.description}</p>
        </div>
        <div className="bg-foreground my-1 h-[1px] w-full" />
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
  );
};

export default ProjectSlide;
