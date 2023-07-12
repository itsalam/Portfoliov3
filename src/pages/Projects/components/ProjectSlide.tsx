import { Carousel, Embla } from '@mantine/carousel';
import { BackgroundImage, Badge, Overlay, Text, useMantineTheme } from '@mantine/core';
import Github from '@src/assets/github.svg';
import Link from '@src/assets/link.svg';
import { Project } from '@src/store/types';
import anime, { AnimeInstance } from 'animejs';
import { HTMLProps, useCallback, useEffect, useRef, useState } from 'react';
import LinkHref from './HrefLink';

const ProjectSlide = (
  props: HTMLProps<HTMLDivElement> & {
    embla: Embla;
    imgSrc: string;
    index: number;
    project: Project;
  }
) => {
  const { embla, imgSrc, index: i, project } = props;
  const ref = useRef<HTMLDivElement>(null);
  const theme = useMantineTheme();

  const Links = useCallback(
    () => (
      <>
        <LinkHref dataSrc={Link} href={project.link} />
        <LinkHref dataSrc={Github} href={project.githublink} />
      </>
    ),
    []
  );

  const [expandProject, setExpandProject] = useState<AnimeInstance>();

  const animateProject = (animation?: AnimeInstance) => {
    console.log(animation?.began);
    if (animation?.began) {
      animation.reverse();
    }

    animation?.play();
  };

  // TODO have a use for expanding the card
  const onProjectClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandProject((currAnim) => {
      let anim = currAnim;
      if (!anim) {
        anim = anime({
          targets: ref.current,
          'flex-basis': ['33%', '60%'],
          easing: 'easeOutQuint',
          autoplay: false,
          update: () => {
          },
        });
      }

      animateProject(anim);
      return anim;
    });

    embla.scrollTo(i, false);
  };

  useEffect(() => {
    const headingText = ref.current ? ref.current.querySelector('.heading-text') as HTMLDivElement : null;
    if (headingText) {
      const initialWidth = headingText.clientWidth;
      headingText.style.maxWidth = `${initialWidth}px`;
      headingText.style.width = `${initialWidth}px`;
      headingText.style.flexBasis = `${initialWidth}px`;
    }
  }, []);

  return (

    <Carousel.Slide key={`p-${i}`} ref={ref} className="relative mr-6 min-w-[20rem]" onClick={onProjectClick}>
      <BackgroundImage
        src={imgSrc}
        onClick={(e) => e.preventDefault()}
        className="project-overlay mask group relative h-full rounded-xl transition-all hover:brightness-110"
      />

      <Overlay
        gradient={theme.colorScheme === 'dark' ?
          'linear-gradient(5deg, rgba(0, 0, 0, 0.9) 33%, rgba(0, 0, 0, 0.1) 100%)' :
          'linear-gradient(5deg, rgba(255, 255, 255, 0.9) 33%, rgba(255, 255, 255, 0.1) 100%)'}
        opacity={0.85}
        style={{ marginRight: 'inherit' }}
        className="sticky inset-y-0 flex h-full w-full rounded-xl p-8 transition-all group-hover:backdrop-blur-sm"
      >
        <div className="heading-text primary-font flex w-full flex-1 basis-full flex-col content-between justify-end ">
          <div>
            <Text fw={500} className="muted-color font-code flex gap-2  tracking-wider" c="white">
              PROJECT
            </Text>

            <div className="flex "><Links /></div>
            <h1 className="muted-color ">
              {project.name}
            </h1>
            <div className="">
              {project.description}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {project.stack.map((s) => (
              <Badge className="">
                {s.name}
              </Badge>
            ))}
          </div>
        </div>
        {/* <div className="sub-content h-full flex-1" /> */}
      </Overlay>
    </Carousel.Slide>
  );
};

export default ProjectSlide;
