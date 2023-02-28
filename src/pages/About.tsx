import React, { useEffect, useState } from "react";
import anime from "animejs";
import cn from "classnames";

const SPIN_DURATION = 1500;
const LOOP_DELAY = 3500;

const titleAnimation = {
  top: ["0%", "-100%"],
  middle: ["100%", "0%"],
  bottom: ["100%", "100%"],
};

const getLoopValue = (i, offset) => {
  const animations = Object.values(titleAnimation);
  const len = animations.length;
  i += offset;
  const value = animations[i % len];
  return value;
};

const translateY = (offset) => ({
  translateY: (el, i, l) => getLoopValue(i, offset),
  duration: SPIN_DURATION,
});

 const titleLoop = (styles) => {
  anime
    .timeline({
      loop: true,
    })
    .add({
      targets: `.${styles.titleContent} .${styles.title}`,
      keyframes: [translateY(0), translateY(2), translateY(1)],
      delay: LOOP_DELAY,
      easing: "easeOutQuart",
    })
    .add(
      {
        targets: `.${styles.a}`,
        keyframes: [translateY(1), { ...translateY(0), delay: SPIN_DURATION }],
        delay: LOOP_DELAY,
        easing: "easeOutQuart",
      },
      0
    );
};

const revealHome = (styles) => {
  anime
    .timeline({
      targets: document.querySelectorAll(`.${styles.revealer}`),
      translateY: [200, 0],
      easing: "easeOutQuart",
      delay: anime.stagger(100, { easing: "easeInQuad" }),
    })
    .add({
      targets: document.querySelectorAll(
        `.${styles.revealer}>span, .${styles.titleContent}`
      ),
      translateY: [-200, 0],
      easing: "easeOutQuart",
      delay: anime.stagger(100, { easing: "easeInQuad" }),
    });
};

const GREETING = "Hey there, I’m";
const TITLES = ["Vincent Lam", "Full-Stack Developer", "Front-end Developer"];
const BODY =
  "I’m a developer based in Vancouver with a knack for developing web applications for internal company use. I like building things that are both elegant and robust with the most modern tools available.";

export default function Home(props: {}) {
//   const {slideIndex} = props;
//   const currentSlide = slideStore((state) => state.currentSlide);
  
  let [hasPlayed, setHasPlayed] = useState(false);

//   useEffect(() => {
//     if (slideIndex === currentSlide && !hasPlayed){
//     //   revealHome(styles);
//       setHasPlayed(true);
//     }
//   }, [currentSlide])

  useEffect(() => {
    //   titleLoop(styles);
  }, []);

  const revealer = "relative w-full overflow-x-clip overflow-y-hidden";
  const title = ""
  const titlePlaceholder = ""
  const titleContent = "h-full w-full absolute overflow-hidden top-0 left-0"
  const revealerSpan = "flex relative transform-none"
  return (
    <div className={"flex flex-col"}>
      <div className={cn([revealer, "mainText mix-blend-difference"])}>
        <span className={revealerSpan}>
          {GREETING}
          <div className={"whitespace-pre"}> (a)</div>
        </span>
      </div>
      <div className={cn(["flex absolute whitespace-nowrap", revealer])}>
        <span className={cn(["title", titlePlaceholder, revealerSpan])}>
          FULL_STACK_DEV
        </span>
        <div className={titleContent}>
          {TITLES.map((title) => (
            <div className={cn(["title"])} key={title}>
              <span>
                {`${title} /`}<br />
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className={cn([revealer,  "mainText mix-blend-difference"])}>
        <span>{BODY}</span>
      </div>
    </div>
  );
}
