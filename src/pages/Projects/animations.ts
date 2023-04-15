import anime, { AnimeTimelineInstance } from 'animejs';

export const scrollAnimation = anime({
  targets: '.project img',
  objectPosition: ['center 100%', 'center 0%'],
  easing: 'linear'
});

export const animateProject = (index: number): AnimeTimelineInstance => {
  const targets = `.project:nth-of-type(${index + 1})`;
  return anime
    .timeline({
      autoplay: true
    })
    .add(
      {
        targets: `${targets}:not(.mobile)`,
        keyframes: [
          {
            easing: 'easeInOutCirc',
            height: ['30vh', '55vh'],
            duration: 750
          },
          {
            easing: 'easeInOutCirc',
            width: ['66.667%', '100%'],
            duration: 450,
            delay: 50
          }
        ]
      },
      0
    )
    .add(
      {
        targets: `${targets}.mobile>div`,
        keyframes: [
          {
            easing: 'easeInOutCirc',
            height: ['8rem', '28rem'],
            duration: 750
          }
        ]
      },
      0
    )
    .add(
      {
        targets: `${targets}:not(.mobile)>.carousel`,
        opacity: ['0%', '100%'],
        easing: 'easeInOutCirc',
        delay: 1250,
        duration: 450
      },
      0
    )
    .add(
      {
        targets: `${targets} .fullDescription`,
        keyframes: [
          {
            easing: 'easeInOutCirc',
            height: ['0%', '100%'],
            delay: 1050,
            duration: 550
          },
          {
            easing: 'linear',
            opacity: ['100%'],
            delay: 150,
            duration: 250
          }
        ]
      },
      0
    )
    .add(
      {
        targets: `.project:not(.focused)`,
        opacity: ['100%', '50%'],
        duration: 250
      },
      0
    )
    .add(
      {
        targets: `div${targets} .revealer>*`,
        delay: anime.stagger(250, { easing: 'easeInQuad' }),
        keyframes: [
          {
            translateY: ['0%', '100%'],
            duration: 250
          },
          {
            translateY: ['-100%', '0%'],
            delay: 250,
            duration: 450,
            begin(anim) {
              setTimeout(() => {
                const elem = anim as unknown as HTMLElement;
                elem.style.textAlign = 'start';
                if (elem.classList.contains('subTitle')) {
                  elem.classList.toggle('expanded', true);
                }
                if (elem.classList.contains('description')) {
                  elem.style.height = '0';
                }
              }, 600);
            }
          }
        ],
        easing: 'easeInOutCirc'
      },
      0
    );
};

export const animateProjectReverse = (index: number) => {
  const targets = `.project:nth-of-type(${index + 1})`;
  anime
    .timeline({
      autoplay: true
    })
    .add(
      {
        targets: `${targets}:not(.mobile)`,
        keyframes: [
          {
            easing: 'easeInOutCirc',
            height: ['55vh', '30vh'],
            width: ['100%', '66.667%'],
            duration: 750
          }
        ]
      },
      0
    )
    .add(
      {
        targets: `${targets}.mobile>div`,
        keyframes: [
          {
            easing: 'easeInOutCirc',
            height: ['28rem', '8rem'],
            duration: 750
          }
        ]
      },
      0
    )
    .add(
      {
        targets: `${targets}:not(.mobile)>.carousel`,
        opacity: ['100%', '0%'],
        easing: 'easeInOutCirc',
        duration: 250
      },
      0
    )
    .add(
      {
        targets: `${targets} .fullDescription`,
        keyframes: [
          {
            opacity: ['0%'],
            duration: 0
          },
          {
            height: ['100%', '0%'],
            duration: 750,
            easing: 'easeOutCirc'
          }
        ]
      },
      0
    )
    .add(
      {
        targets: `.project:not(.focused)`,
        keyframes: [
          {
            opacity: ['50%', '100%'],
            duration: 250,
            easing: 'easeOutCirc'
          }
        ]
      },
      0
    )
    .add(
      {
        targets: `${targets} .revealer>*`,
        delay: anime.stagger(100, { start: 0 }),
        keyframes: [
          {
            translateY: ['-100%', '0%'],
            duration: 250,
            delay: 800,
            opacity: (el: Element) => {
              console.log(el);
              return el.classList.contains('fullDescription') ? '0%' : '100%';
            },
            begin(anim) {
              const elem = anim as unknown as HTMLElement;
              elem.style.textAlign = '';
              if (elem.classList.contains('subTitle')) {
                elem.classList.toggle('expanded', false);
              }
              if (elem.classList.contains('description')) {
                elem.style.height = '';
              }
            }
          }
        ],
        easing: 'easeInOutCirc'
      },
      0
    );
};
