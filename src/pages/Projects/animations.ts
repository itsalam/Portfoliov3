import anime from "animejs";

export const scrollAnimation = anime({
  targets: ".project img",
  objectPosition: ["center 100%", "center 0%"],
  easing: "linear",
});

export const animateProject = (index: number) =>
  anime
    .timeline({
      autoplay: true,
    })
    .add(
      {
        targets: `.project:nth-of-type(${index + 1})`,
        keyframes: [
          {
            easing: "easeInOutCirc",
            height: ["30vh", "55vh"],
            duration: 750,
          },
          {
            easing: "easeInOutCirc",
            width: ["66.667%", "100%"],
            duration: 450,
            delay: 50,
          },
        ],
      },
      0
    )
    .add(
      {
        targets: `.project:nth-of-type(${index + 1})>.carousel`,
        opacity: ["0%", "100%"],
        easing: "easeInOutCirc",
        delay: 1250,
        duration: 450,
      },
      0
    )
    .add(
      {
        targets: `.project:nth-of-type(${index + 1}) .fullDescription`,
        keyframes: [
          {
            easing: "easeOutCirc",
            opacity: ["0%"],
            duration: 0,
          },
          {
            easing: "easeOutCirc",
            height: ["0%", "100%"],
            delay: 400,
            duration: 500,
          },
          {
            easing: "easeOutCirc",
            opacity: ["100%"],
            duration: 0,
          },
        ],
      },
      0
    )
    .add(
      {
        targets: `.project:not(.focused)`,
        opacity: ["100%", "50%"],
        duration: 250,
      },
      0
    )
    .add(
      {
        targets: `div.project:nth-of-type(${index + 1}) .revealer>*`,
        delay: anime.stagger(150, { easing: "easeInQuad" }),
        keyframes: [
          {
            translateY: ["0%", "100%"],
            duration: 450,
          },
          {
            translateY: ["-100%", "0%"],
            delay: 1000,
            duration: 450,
            begin(anim) {
              setTimeout(() => {
                const elem = anim as unknown as Element;
                elem.style.textAlign = "start";
                if (elem.classList.contains("subTitle")) {
                  elem.classList.toggle("text-5xl", true);
                }
                if (elem.classList.contains("description")) {
                  elem.style.height = "0";
                }
              }, 600);
            },
          },
        ],
        easing: "easeInOutCirc",
      },
      0
    );

export const animateProjectReverse = (index: number) =>
  anime
    .timeline({
      autoplay: true,
    })
    .add(
      {
        targets: `.project:nth-of-type(${index + 1})`,
        keyframes: [
          {
            easing: "easeInOutCirc",
            height: ["55vh", "30vh"],
            width: ["100%", "66.667%"],
            duration: 750,
          },
        ],
      },
      0
    )
    .add(
      {
        targets: `.project:nth-of-type(${index + 1})>.carousel`,
        opacity: ["100%", "0%"],
        easing: "easeInOutCirc",
        duration: 250,
      },
      0
    )
    .add(
      {
        targets: `.project:nth-of-type(${index + 1}) .fullDescription`,
        keyframes: [
          {
            height: ["100%", "0%"],
            duration: 750,
            easing: "easeOutCirc",
          },
        ],
      },
      0
    )
    .add(
      {
        targets: `.project:not(.focused)`,
        keyframes: [
          {
            opacity: ["50%", "100%"],
            duration: 250,
            easing: "easeOutCirc",
          },
        ],
      },
      0
    )
    .add(
      {
        targets: `.project:nth-of-type(${index + 1}) .revealer>*`,
        delay: anime.stagger(100, { start: 0 }),
        keyframes: [
          // {
          //   opacity: ["0%"],
          //   duration: 0,
          // },
          {
            opacity: ["100%"],
            translateY: ["-100%", "0%"],
            duration: 250,
            delay: 800,

            begin(anim) {
              const elem = anim as unknown as Element;
              elem.style.textAlign = "";
              if (elem.classList.contains("subTitle")) {
                elem.classList.toggle("text-5xl", false);
              }
              if (elem.classList.contains("description")) {
                elem.style.height = "";
              }
            },
          },
        ],
        easing: "easeInOutCirc",
      },
      0
    );
