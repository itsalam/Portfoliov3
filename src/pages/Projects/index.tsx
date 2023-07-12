import useStore from '@src/store';
import { Project } from '@src/store/types';
import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { Carousel } from '@mantine/carousel';
import { Flex } from '@mantine/core';
import { Title } from '@src/components/Commons';
import ProjectContent from './components/ProjectSlide';

export default function Projects() {
  const [embla, setEmbla] = useState<Embla | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const { projects, getSrc } = useStore.getState();

  const handleScroll = useCallback(() => {
    if (!embla) return;
    const progress = Math.max(0, Math.min(1, embla.scrollProgress()));
    setScrollProgress(progress * 100);
  }, [embla, setScrollProgress]);

  useEffect(() => {
    if (embla) {
      embla.on('scroll', handleScroll);
      handleScroll();
    }
  }, [embla]);

  const renderProjects = (project: Project, i: number) => (
    <ProjectContent
      embla={embla}
      project={project}
      index={i}
      imgSrc={getSrc ? getSrc(project.thumbnails[0]) : ''}
      getSrc={getSrc}
    />
  );

  return (
    <Flex
      h="100vh"
      w="100%"
      className="projectTrack min-h-[80vh] sm:min-h-screen sm:p-16"
      id="projects"
      direction="column"
      gap="xl"
    >
      <Title scrollProgress={scrollProgress}>Projects</Title>
      <Carousel
        breakpoints={[{ maxWidth: 'sm', slideSize: '100%', slideGap: '2rem' }]}
        slideGap="xl"
        align="start"
        loop
        slideSize="33.333333%"
        height="100%"
        controlSize={10}
        controlsOffset="xl"
        className="project-carousel sm:mask max-h-[40rem] max-w-screen-2xl flex-1 overflow-hidden py-16"
        getEmblaApi={setEmbla}
      >
        {projects && projects.map(renderProjects)}
      </Carousel>

    </Flex>

  );
}
