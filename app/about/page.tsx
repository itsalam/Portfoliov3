"use client";

import { BackButton } from "@/components/BackButton";
import Track from "@/components/Track";
import { animateTransition, useScrollNavigation } from "@/lib/clientUtils";
import { cn } from "@/lib/utils";
import { Text as BaseText } from "@radix-ui/themes";
import { LayoutGroup, motion, useAnimate } from "framer-motion";
import { debounce } from "lodash";
import { LoremIpsum } from "lorem-ipsum";
import Image from "next/image";
import { FC, useRef, useState } from "react";
import { ProjectTitle } from "./components";

const lorem = new LoremIpsum();
type Project = {
  name: string;
  description: string;
  image: string;
  url: string;
  tags: string[];
};

const PROJECTS: Project[] = Array.from({ length: 4 }).map((_, i) => ({
  name: `Project ${i + 1}`,
  description: lorem.generateSentences(3),
  image: `https://picsum.photos/seed/${Math.floor((i + 1) * 100)}/1000/800`,
  url: `https://example.com/project${i + 1}`,
  tags: ["React", "TypeScript", "CSS"],
}));

const Page: FC = () => {
  const [aboutRef] = useAnimate();
  const { controls } = useScrollNavigation(aboutRef);
  const [focusedProject, setFocusedProject] = useState<Project>();
  const [selectedProject, setSelectedProject] = useState<Project>();
  const clickedProject = useRef<Project>();
  const dragRef = useRef(false);
  const DEFAULT_TEXT = "Scroll or drag to navigate.";

  const cardTransition = {
    selected: (i: number) => ({
      opacity: PROJECTS[i].name === clickedProject.current?.name ? 1 : 0,
      y: PROJECTS[i].name === clickedProject.current?.name ? "0%" : "25%",
      ...(PROJECTS[i].name === clickedProject.current?.name && {
        width: "calc(var(--grid-width) * 10)",
        height: "calc(var(--grid-height) * 6)",
        top: "calc(var(--grid-height) * -0.5)",
      }),
      transition: {
        stagger: 0.033 * i,
        duration: 0.5,
      },
    }),
    deselected: (i: number) => ({
      opacity: PROJECTS[i].name !== clickedProject.current?.name ? 0 : 1,
      ...(PROJECTS[i].name === clickedProject.current?.name && {
        width: "calc(var(--grid-width) * 5)",
        height: "calc(var(--grid-height) * 4)",
        top: 0,
      }),
      transition: {
        stagger: 0.033 * i,
        duration: 0.66,
      },
    }),
  };

  const changeFocusTitle = debounce((project?: Project) => {
    setFocusedProject(project);
    setTimeout(() => controls.start("animate"), 50);
  }, 750);

  const changeSelectedProject = (project?: Project) => {
    clickedProject.current = project || selectedProject;
    const variant = project ? "selected" : "deselected";
    if (project) {
      controls.start(variant).then(() => setSelectedProject(project));
    } else {
      setSelectedProject(project);
      controls.start(variant).then(() => (clickedProject.current = undefined));
    }
  };

  const TextBody = (props: { className?: string }) => (
    <motion.div
      layoutId="arrow"
      transition={{
        opacity: { ease: "linear" },
        layout: { duration: 0.366 },
      }}
      className={cn(
        "flex flex-col z-10 absolute mix-blend-lighten w-g-x-3",
        props.className
      )}
    >
      <ProjectTitle
        title={(selectedProject || focusedProject)?.name || "Projects."}
      />
      <BaseText
        size={"5"}
        className={cn("z-10", {
          "w-full": selectedProject,
          "w-g-x-2": !selectedProject,
        })}
      >
        {selectedProject?.description || DEFAULT_TEXT}
      </BaseText>
    </motion.div>
  );

  return (
    <motion.div
      animate={controls}
      ref={aboutRef}
      initial="initial"
      id="about"
      key={"about"}
      variants={{
        ...animateTransition,
        exit: {
          opacity: 0,
          y: "30%",
          transition: {
            duration: 0.33,
          },
        },
      }}
      className={cn(
        "px-g-x-1 mb-g-y-0.5 pt-g-y-2.5 flex-1 flex font-display text-grid relative w-screen"
      )}
    >
      <motion.div
        layout="position"
        className={cn("flex flex-col w-full relative", {
          "justify-between gap-x-g-y-0.5 px-g-x-1": selectedProject,
        })}
      >
        <LayoutGroup>
          <Track
            className={cn("gap-g-x-0.5", {
              "w-auto h-full": selectedProject,
              "h-g-y-3": !selectedProject,
            })}
            dragRef={dragRef}
            onHoverEnd={() => changeFocusTitle()}
          >
            {PROJECTS.map((project, index) => (
              <motion.div
                layout
                key={index}
                custom={index}
                className={cn(
                  "card flex flex-row items-end justify-end relative p-2 h-g-y-4 border border-[#ffffff16] rounded-3xl overflow-hidden group cursor-pointer duration-300",
                  {
                    // "h-g-y-6 -top-g-y-0.5": selectedProject?.name === project.name,
                  }
                )}
                onHoverStart={() => changeFocusTitle(project)}
                onClick={() =>
                  !dragRef.current &&
                  !selectedProject &&
                  changeSelectedProject(project)
                }
                variants={{ ...animateTransition, ...cardTransition }}
              >
                <div className="overflow-hidden rounded-2xl w-g-x-5 h-full">
                  <Image
                    className={cn(
                      "track-img object-cover h-full w-full",
                      "transition-all duration-500 brightness-75",
                      {
                        "group-hover:blur-none group-hover:scale-105 group-hover:brightness-100":
                          !selectedProject,
                        "blur-sm":
                          focusedProject &&
                          focusedProject?.name !== project.name,
                        "blur-none brightness-100": selectedProject,
                      }
                    )}
                    src={project.image}
                    draggable={false}
                    alt="project image"
                    width={500}
                    height={400}
                  />
                  {selectedProject?.name === project.name && (
                    <TextBody className="left-g-x-1.5 top-g-y-0.5" />
                  )}
                </div>
                <BackButton
                  onClick={() => changeSelectedProject()}
                  className={cn(
                    "top-0 ml-g-x-0.25 translate-y-1/2 absolute left-0 opacity-0",
                    { "opacity-100": selectedProject }
                  )}
                />
              </motion.div>
            ))}
          </Track>
          {!selectedProject && <TextBody className="bottom-g-y-0.5" />}
        </LayoutGroup>
      </motion.div>
    </motion.div>
  );
};

export default Page;
