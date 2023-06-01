import { cx } from '@vechaiui/react';
import anime from 'animejs';
import { HTMLProps, useEffect } from 'react';
import useStore from '../store';

const SPIN_DURATION = 2000;
const LOOP_DELAY = 3500;

const titleKeyframes = [
  ['0%', '100%'],
  ['100%', '100%'],
  ['-100%', '0%']
];

const translateY = (offset: number) => ({
  translateY: (_el: Element, i: number) =>
    titleKeyframes[(i + offset) % titleKeyframes.length],
  opacity: 1,
  duration: SPIN_DURATION
});

const GREETING = 'Hey there, I’m';
const TITLES = [
  'Vincent\nLam',
  'Full-Stack\nDeveloper',
  'Front-end\nDeveloper'
];
const BODY =
  'I’m a developer based in Vancouver with a knack for developing web applications for internal company use. I like building things that are both elegant and robust with the most modern tools available.';

export default function Home(props: HTMLProps<HTMLDivElement>) {
  const { pages, setActivePage } = useStore.getState();
  const { getSrc, technologies } = useStore.getState();

  const titleLoop = () =>
    anime
      .timeline({
        loop: true,
        delay: SPIN_DURATION
      })
      .add({
        targets: `#home .titleContent>.homeTitle`,
        keyframes: [translateY(0), translateY(1), translateY(2)],
        delay: LOOP_DELAY,
        easing: 'easeOutQuint'
      })
      .add(
        {
          targets: `#home .aTitle`,
          keyframes: [
            translateY(2),
            { ...translateY(0), delay: SPIN_DURATION }
          ],
          delay: LOOP_DELAY,
          easing: 'easeOutQuint'
        },
        0
      );

  const revealHome = () =>
    anime
      .timeline({
        begin(anim) {
          addEventListener('mousedown', () => anim.seek(anim.duration), {
            once: true
          });
        },
        complete: () => {
          const activePage = pages.findIndex(
            (page) =>
              page.localeCompare(window.location.hash.substring(1), undefined, {
                sensitivity: 'base'
              }) === 0
          );

          setActivePage(Math.max(activePage, 0));
        }
      })
      .add(
        {
          targets: `#home .introText`,
          translateY: ['-25%', '0%'],
          opacity: [0, 1],
          easing: 'easeOutQuint',
          delay: (_, i, l) => [500, 800, 1500, 2050][i % l]
        },
        0
      )
      .add(
        {
          targets: `#home .revealer>*:first-child`,
          translateY: ['-25%', '0%'],
          opacity: [0, 1],
          easing: 'easeOutQuint',
          delay: anime.stagger(1250)
        },
        2500
      )
      .add({
        targets: `#home .techs`,
        opacity: [0, 1],
        delay: () => anime.random(150, 350),
        complete: () => {
          titleLoop();
        }
      })
      .add(
        {
          targets: '.intro-revealer',
          opacity: [0, 1],
          duration: 500,
          easing: 'linear'
        },
        3500
      );

  useEffect(() => {
    revealHome();
  }, []);

  return (
    <div
      className={
        'm-auto flex h-screen w-full snap-center flex-col justify-center'
      }
      id="home"
      {...props}
    >
      <div className={cx('greeting-revealer mainText mix-blend-difference')}>
        <span className={'revealerSpan'}>
          {GREETING.split(' ').map((text, i) =>
            <span key={`word-${i}`} className={'introText'}>{text} </span>
          )}
          <div className={'aTitle -translate-y-full whitespace-pre'}>(a)</div>
        </span>
      </div>
      <div className={cx(['revealer flex xl:my-2'])}>
        <div
          className={
            'titleContent text-w-full relative h-40 w-full sm:h-20 2xl:h-28'
          }
        >
          {TITLES.map((text, i) => (
            <div
              className={cx('homeTitle', 'w-full h-full', {
                ['text-foreground']: i == 0,
                ['text-foreground/75 opacity-0']: i == 1,
                ['text-muted opacity-0']: i == 2
              })}
              key={text}
            >
              <span className="relative flex whitespace-pre-wrap sm:whitespace-nowrap">
                {`${text} /`}
                <br />
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className={cx(['revealer mainText mix-blend-difference'])}>
        <span className={'revealerSpan'}>{BODY}</span>
      </div>
      <div className={cx(['revealer subTitle text-muted p-5 md:pt-10'])}>
        <span className={'revealerSpan'}>Things I like Using:</span>
        <div className="flex w-full flex-wrap justify-evenly p-1 md:p-4 xl:flex-nowrap">
          {technologies &&
            getSrc &&
            technologies
              .filter((t) => t.mainTech)
              .map((tech) => {
                const svgUrl = getSrc(tech.thumbnail);
                return (
                  <div
                    key={svgUrl}
                    className="techs text-foreground m-2 flex h-12 w-12 flex-col items-center md:h-16 md:w-16"
                  >
                    <svg
                      className="icon h-12 w-12"
                      data-src={svgUrl}
                      {...{
                        [tech.thumbnail.stroke ? 'stroke' : 'fill']:
                          'currentColor'
                      }}
                    />
                    <p className="text-sm xl:text-base">{tech.name}</p>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
}
