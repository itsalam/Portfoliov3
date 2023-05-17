import anime, { AnimeTimelineInstance } from 'animejs';

export const scrollAnimation = anime({
  targets: '.project img',
  objectPosition: ['center 100%', 'center 0%'],
  easing: 'linear'
});

export const animateProject = (index: number): AnimeTimelineInstance => {
  const targets = `#projects .swiper-slide:nth-of-type(${index + 1}) .project`;
  return anime
    .timeline({
      autoplay: true
    })
    .add(
      {
        targets: `${targets}`,
        keyframes: [
          {
            easing: 'easeInOutCirc',
            height: ['66.667%', '90%'],
            duration: 750
          }
        ]
      },
      0
    )
    .add(
      {
        targets: `${targets}:not(.mobile)`,
        keyframes: [
          {
            easing: 'easeInOutCirc',
            width: ['66.667%', '100%'],
            duration: 650,
            delay: 850
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
            height: ['8rem', '20rem'],
            duration: 750
          }
        ]
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
            delay: 1250,
            duration: 550
          },
          {
            easing: 'linear',
            opacity: ['100%'],
            delay: 350,
            duration: 250
          }
        ]
      },
      0
    )
    .add(
      {
        targets: `.project:not(.focused)`,
        opacity: ['100%', '66%'],
        duration: 250
      },
      0
    )
    .add(
      {
        targets: `div${targets} .revealer>*`,
        delay: anime.stagger(100, { easing: 'easeInOutCirc' }),
        keyframes: [
          {
            translateY: ['0%', '100%'],
            duration: 250
          },
          {
            translateY: ['-100%', '0%'],
            delay: 350,
            duration: 450,
            begin(anim) {
              setTimeout(() => {
                const elem = anim as unknown as HTMLElement;
                elem.style.textAlign = 'start';
                elem.style.flexDirection = 'row';
                if (elem.classList.contains('subTitle')) {
                  elem.classList.toggle('expanded', true);
                }
                if (elem.classList.contains('description')) {
                  elem.style.display = 'none';
                }
                if (elem.classList.contains('links')) {
                  elem.style.flexDirection = 'row';
                }
              }, 600);
            }
          }
        ],
        easing: 'easeOutQuint'
      },
      0
    );
};

export const animateProjectReverse = (index: number) => {
  const targets = `#projects .swiper-slide:nth-of-type(${index + 1}) .project`;
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
            height: ['90%', '66.667%'],
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
            height: ['22rem', '8rem'],
            duration: 750
          }
        ]
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
            easing: 'easeOutQuint'
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
            opacity: ['66%', '100%'],
            duration: 250
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
              return el.classList.contains('fullDescription') ? '0%' : '100%';
            },
            begin(anim) {
              const elem = anim as unknown as HTMLElement;
              elem.style.textAlign = '';
              if (elem.classList.contains('subTitle')) {
                elem.classList.toggle('expanded', false);
              }
              if (elem.classList.contains('description')) {
                elem.style.display = 'block';
              }
              if (elem.classList.contains('links')) {
                elem.style.flexDirection = elem.classList.contains(
                  'md:flex-row-reverse'
                )
                  ? 'row-reverse'
                  : 'row';
              }
            }
          }
        ],
        easing: 'easeOutQuint'
      },
      0
    );
};
