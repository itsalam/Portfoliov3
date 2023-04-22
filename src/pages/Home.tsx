import { HTMLProps, useEffect } from 'react';
import anime from 'animejs';
import { cx } from "@vechaiui/react";
import useStore from '../store';
import { pageRef } from '../etc/helper';

const SPIN_DURATION = 2000;
const LOOP_DELAY = 3500;

const titleKeyframes = [
  ['0%', '100%'],
  ['100%', '100%'],
  ['-100%', '0%'],
]

const translateY = (offset: number) => ({
  translateY: (_el: Element, i: number) =>
    titleKeyframes[(i + offset) % titleKeyframes.length],
  opacity: 1,
  duration: SPIN_DURATION
});

const titleLoop = () =>
  anime
    .timeline({
      loop: true,
      delay: SPIN_DURATION,
    })
    .add({
      targets: `#home .titleContent>.homeTitle`,
      keyframes: [translateY(0), translateY(1), translateY(2)],
      delay: LOOP_DELAY,
      easing: 'easeOutExpo'
    })
    .add(
      {
        targets: `#home .aTitle`,
        keyframes: [translateY(2), { ...translateY(0), delay: SPIN_DURATION }],
        delay: LOOP_DELAY,
        easing: 'easeOutExpo'
      },
      0
    );

const revealHome = () => anime.timeline({
  begin(anim) {
    addEventListener("mousedown", () => anim.seek(anim.duration), { once: true });
  },
})
  .add({
    targets: `#home .revealer>*:first-child, #home .revealer .introText`,
    translateY: ["-25%", "0%"],
    opacity: [0, 1],
    easing: "easeOutExpo",
    delay: anime.stagger(600, { easing: "easeInQuad" }),
  }, 0)
  .add({
    targets: `#home .techs`,
    opacity: [0, 1],
    delay: anime.stagger(75, { easing: "easeInQuad" }),
    complete: () => {
      titleLoop();
    }
  }).add({
    targets: ".intro-revealer",
    opacity: [0, 1],
    duration: 500,
    easing: "linear"
  }, 2500);

const GREETING = 'Hey there, I’m';
const TITLES = ['Vincent\nLam', 'Full-Stack\nDeveloper', 'Front-end\nDeveloper'];
const BODY =
  'I’m a developer based in Vancouver with a knack for developing web applications for internal company use. I like building things that are both elegant and robust with the most modern tools available.';

export default function Home(props: HTMLProps<HTMLDivElement>) {
  const { imageBuilder, technologies } = useStore.getState();
  const { containerCallback } = pageRef();

  useEffect(() => {
    revealHome();
  }, []);

  return (
    <div
      className={
        'm-auto flex h-screen w-full snap-center flex-col justify-center'
      }
      ref={containerCallback}
      id="home"
      {...props}
    >
      <div className={cx('revealer mainText mix-blend-difference')}>
        <span className={'revealerSpan'}>
          {GREETING.split(" ").map((text) => <span className={'introText'}>{text} </span>)}
          <div className={'aTitle -translate-y-full whitespace-pre'}>(a)</div>
        </span>
      </div>
      <div className={cx(['revealer flex xl:my-2'])}>
        <div className={'titleContent text-w-full relative h-40 w-full sm:h-20 2xl:h-28'}>
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
        <div className="flex w-full flex-wrap justify-evenly p-4 xl:flex-nowrap">
          {(technologies && imageBuilder) &&
            technologies.map((tech) => {
              const svgUrl = imageBuilder.image(tech.thumbnail).url();
              return (
                <div key={svgUrl} className="techs text-foreground m-2 flex h-16 w-16 flex-col items-center">
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
