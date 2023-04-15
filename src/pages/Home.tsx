import { HTMLProps, useEffect } from 'react';
import anime from 'animejs';
import cn from 'classnames';
import useStore from '../store';
import { pageRef } from '../etc/helper';

const SPIN_DURATION = 1500;
const LOOP_DELAY = 3500;

const titleAnimation = {
  top: ['-100%', '0%'],
  middle: ['0%', '100%'],
  bottom: ['100%', '100%']
};

const getLoopValue = (i: number, offset: number) => {
  const animations = Object.values(titleAnimation);
  const value = animations[(i + offset) % animations.length];
  return value;
};

const translateY = (offset: number) => ({
  translateY: (_el: Element, i: number) => getLoopValue(i, offset),
  duration: SPIN_DURATION
});

const titleLoop = () => {
  anime
    .timeline({
      loop: true
    })
    .add({
      targets: `#home .titleContent>.homeTitle`,
      keyframes: [translateY(1), translateY(2), translateY(0)],
      delay: LOOP_DELAY,
      easing: 'easeOutQuart'
    })
    .add(
      {
        targets: `#home .aTitle`,
        keyframes: [translateY(0), { ...translateY(1), delay: SPIN_DURATION }],
        delay: LOOP_DELAY,
        easing: 'easeOutQuart'
      },
      0
    );
};

// const revealHome = () => {
//   anime
//     .timeline({
//       targets: `.revealer`,
//       translateY: [-200, 0],
//       easing: "easeOutQuart",
//       delay: anime.stagger(100, { easing: "easeInQuad" }),
//     })
//     .add({
//       targets: `.revealer>span, .titleContent`,
//       translateY: [-200, 0],
//       easing: "easeOutQuart",
//       delay: anime.stagger(100, { easing: "easeInQuad" }),
//     });
// };

const GREETING = 'Hey there, I’m';
const TITLES = ['Vincent\nLam', 'Full-Stack\nDeveloper', 'Front-end\nDeveloper'];
const BODY =
  'I’m a developer based in Vancouver with a knack for developing web applications for internal company use. I like building things that are both elegant and robust with the most modern tools available.';

export default function Home(props: HTMLProps<HTMLDivElement>) {
  const { imageBuilder, technologies } = useStore.getState();
  const { containerCallback } = pageRef();

  useEffect(() => {
    titleLoop();
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
      <div className={cn('revealer mainText mix-blend-difference')}>
        <span className={'revealerSpan'}>
          {GREETING}
          <div className={'aTitle whitespace-pre'}> (a)</div>
        </span>
      </div>
      <div className={cn(['revealer flex xl:my-2'])}>
        <span className={cn(['revealerSpan', 'opacity-0 2xl:h-28 sm:h-20 h-40 w-full'])}></span>
        <div className={'titleContent text-w-full'}>
          {TITLES.map((text, i) => (
            <div
              className={cn('homeTitle', 'w-full h-full', {
                ['text-foreground']: i == 0,
                ['text-foreground/75']: i == 1,
                ['text-muted']: i == 2
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
      <div className={cn(['revealer mainText mix-blend-difference'])}>
        <span>{BODY}</span>
      </div>
      <div className={cn(['revealer subTitle text-muted p-5 md:pt-10'])}>
        Things I like Using:
        <div className="flex w-full flex-wrap justify-evenly p-4 xl:flex-nowrap">
          {technologies &&
            technologies.map((tech) => {
              const svgUrl = imageBuilder.image(tech.thumbnail).url();
              return (
                <div key={svgUrl} className="text-foreground m-2 flex h-16 w-16 flex-col items-center">
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
