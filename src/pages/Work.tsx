/* eslint-disable @typescript-eslint/ban-ts-comment */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { Accordion, Center, Container, Flex, Timeline } from '@mantine/core';
import { Title } from '@src/components/Commons';
import useStore from '@src/store';
import { Work } from '@src/store/types';
import { useState } from 'react';

const convertDate = (date: string) => new Date(date).toLocaleDateString('default', {
  month: 'long',
  year: 'numeric',
});

export default function Work() {
  const [activeTab, setActiveTab] = useState<string>();

  const { works } = useStore();

  const tabAnimation = (opacity: number) =>
    document.querySelector('.tabPanel')?.animate(
      {
        opacity,
      },
      { duration: 250, fill: 'forwards' }
    );

  const renderWork = (work: Work) => (
    // <Tabs.Panel
    //   className="glass transition-all"
    //   value={work.companyName}
    // >
    <Accordion chevronPosition="left" variant="contained" className="glass bg-transparent transition-all">
      {work.experiences.map((experience, i) => (
        <Accordion.Item value={experience.title} className="flex flex-col gap-3" key={i}>
          <Accordion.Control className=" muted-color">
            <h2 className="mainText whitespace-pre-wrap font-normal sm:whitespace-nowrap">
              {experience.title}
              <span className="secondary-color">
                {'\n @ '}
                {work.companyName}
              </span>
            </h2>
            <p className="">
              {convertDate(experience.from)} - {convertDate(experience.to)}
            </p>
          </Accordion.Control>

          <Accordion.Panel className="w-full pl-6">
            {experience.descriptions.map((desc, j) => (
              <p className="primary-font w-full p-1" key={`exp${i}-${j}`}>
                {' '}
                · {desc}
              </p>
            ))}
          </Accordion.Panel>
        </Accordion.Item>

      ))}

    </Accordion>

    // </Tabs.Panel>
  );
  return (
    <Flex
      w="100%"
      className="sm:min-h-screen sm:p-16"
      id="work"
      direction="column"
      gap="xl"
    >
      <Title>Work</Title>
      <Center>
        <Container className="ml-0 flex-1 pt-8">
          {works &&
            <Timeline
              // @ts-ignore
              value={activeTab}
              orientation="vertical"
              defaultValue={works[0].companyName}
              active={2}
              color="primaryColor.5"
              styles={{

                itemBody: {
                  transform: 'translateY(-2rem)',
                },
              }}
            >
              {works.map((work) => (
                <Timeline.Item active>
                  {renderWork(work)}
                </Timeline.Item>
              ))}
            </Timeline>}

        </Container>
      </Center>
    </Flex>
  );
}
