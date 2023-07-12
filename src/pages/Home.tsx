import { Container, Flex, Text } from '@mantine/core';
import Revealer from '@src/components/core/Revealer';
import { getCX } from '@src/etc/Helpers';
import anime from 'animejs';
import { useEffect } from 'react';
import useStore from '../store';

const SPIN_DURATION = 2500;
const LOOP_DELAY = 2500;

const titleKeyframes = [
  ['0%', '100%'],
  ['100%', '100%'],
  ['-100%', '0%'],
];

const translateY = (offset: number) => ({
  translateY: (_el: Element, i: number) =>
    titleKeyframes[(i + offset) % titleKeyframes.length],
  opacity: 1,
  duration: SPIN_DURATION,
});

const GREETING = 'Hey there, I’m';
const TITLES = [
  'Vincent\nLam',
  'Full-Stack\nDeveloper',
  'Front-end\nDeveloper',
];
const BODY =
  'I’m a developer based in Vancouver with a knack for developing web applications for internal company use. I like building things that are both elegant and robust with the most modern tools available.';

export default function Home() {
  const { pages, setActivePage } = useStore.getState();
  const { getSrc, technology } = useStore.getState();
  const { cx } = getCX();

  const titleLoop = () =>
    anime
      .timeline({
        loop: true,
        delay: SPIN_DURATION,
      })
      .add({
        targets: '.homeTitle',
        keyframes: [translateY(0), translateY(1), translateY(2)],
        delay: LOOP_DELAY,
        easing: 'easeOutQuint',
      })
      .add(
        {
          targets: '.a-revealer',
          keyframes: [
            translateY(2),
            { ...translateY(0), delay: SPIN_DURATION },
          ],
          delay: LOOP_DELAY,
          easing: 'easeOutQuint',
        },
        0
      );

  const revealHome = () =>
    anime
      .timeline({
        begin(anim) {
          window.addEventListener('mousedown', () => anim.seek(anim.duration), {
            once: true,
          });
        },
        complete: () => {
          const activePage = pages.findIndex(
            (page) =>
              page.localeCompare(window.location.hash.substring(1), undefined, {
                sensitivity: 'base',
              }) === 0
          );

          setActivePage(Math.max(activePage, 0));
        },
      })
      .add(
        {
          targets: '#home .introText',
          translateY: ['-25%', '0%'],
          opacity: [0, 1],
          easing: 'easeOutQuint',
          delay: (_, i, l) => [250, 400, 750, 1000][i % l],
        },
        0
      )
      .add(
        {
          targets: '#home .revealer>*:first-child',
          translateY: ['-25%', '0%'],
          opacity: [0, 1],
          easing: 'easeOutQuint',
          delay: anime.stagger(1000),
        },
        1500
      )
      .add({
        targets: '#home .techs',
        opacity: [0, 1],
        delay: () => anime.random(150, 350),
        complete: () => {
          titleLoop();
        },
      })
      .add(
        {
          targets: '.intro-revealer',
          opacity: [0, 1],
          duration: 500,
          easing: 'linear',
        },
        3000
      );

  useEffect(() => {
    revealHome();
  }, []);

  return (
    <div className="sm:w-1/2 sm:pl-8" id="home">
      <Container>
        <Flex
          h="100vh"
          direction="column"
          justify="center"
          className="justify-end overflow-x-visible pb-[25%]"
        >
          <Revealer className="mainText">
            <span className="revealer-span">
              {GREETING.split(' ').map((text, i) => (
                <span key={`word-${i}`} className="introText">
                  {text}{' '}
                </span>
              ))}
              <div className="a-revealer -translate-y-full whitespace-pre">(a)</div>
            </span>
          </Revealer>
          <Revealer className="revealer overflow-x-visible">
            <div
              className="titleContent relative h-12 w-full overflow-x-visible sm:h-16 2xl:h-20"
            >
              {TITLES.map((text, i) => (
                <Text
                  variant="gradient"
                  gradient={{ deg: 95, from: 'primaryColor.3', to: 'secondaryColor.3' }}
                  className={cx('absolute w-full h-full title homeTitle overflow-x-visible whitespace-nowrap', {
                    'opacity-0': i !== 0,
                  })}
                  key={text}
                >
                  {`${text}/`}
                </Text>
              ))}
            </div>
          </Revealer>
          <Revealer className="revealer mainText">
            <span className="revealer-span">{BODY}</span>
          </Revealer>
          <Revealer className="revealer subTitle p-4">
            <span className="revealer-span muted-color">Things I like Using:</span>
            <Flex
              className="w-full flex-wrap justify-center p-1 md:p-4 xl:flex-nowrap"

            >
              {technology &&
                getSrc &&
                technology
                  .filter((t) => t.mainTech)
                  .map((tech) => {
                    const svgUrl = getSrc(tech.thumbnail);
                    return (
                      <Flex
                        key={svgUrl}
                        className="techs text-foreground m-2 flex h-12 w-12 flex-col items-center md:h-16 md:w-16 "
                      >
                        <svg
                          className="icon h-12 w-12"
                          data-src={svgUrl}
                          {...{
                            [tech.thumbnail.stroke ? 'stroke' : 'fill']:
                              'currentColor',
                          }}
                        />
                        <p className="text-sm xl:text-base">{tech.name}</p>
                      </Flex>
                    );
                  })}
            </Flex>
          </Revealer>
        </Flex>
      </Container>
    </div>

  );
}
