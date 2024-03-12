"use client";

import { TitleCard } from "@/components/Card";
import { cn } from "@/lib/utils";
import { Text } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { LayoutGroup, motion, useAnimationControls } from "framer-motion";
import { debounce } from "lodash";
import { LoremIpsum } from "lorem-ipsum";
import Image from "next/image";
import { ComponentProps, useRef, useState } from "react";
import { BackButton } from "../BackButton";
import Track from "../Track";

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

import { AnimateText } from "@/components/TextEffects";
import { animateTransition } from "@/lib/clientUtils";
import { FC } from "react";
import { CARD_TYPES } from "./types";

export const ProjectTitle = (props: { className?: string; title: string }) => {
  const { className, title } = props;
  const Title: FC<{ className: string }> = ({ className }) => (
    <AnimateText
      size={"7"}
      className={cn("font-bold", className)}
      text={title}
      variants={animateTransition}
    />
  );

  return (
    <>
      <Title className={cn("mix-blend-color-dodge", className)} />
      <Title className="absolute blur-sm mix-blend-lighten text-[--gray-4]" />
    </>
  );
};

export default function ProjectsCard(props: ComponentProps<typeof motion.div>) {
  const { className, ...rest } = props;
  const projectsRef = useRef(null);
  const controls = useAnimationControls();
  const [focusedProject, setFocusedProject] = useState<Project>();
  const [selectedProject, setSelectedProject] = useState<Project>();
  const clickedProject = useRef<Project>();
  const dragRef = useRef(false);
  const DEFAULT_TEXT = "Scroll or drag to navigate.";

  const cardTransition = {
    selected: (i: number) => ({
      opacity: PROJECTS[i].name === clickedProject.current?.name ? 1 : 0.5,
      transition: {
        stagger: 0.033 * i,
      },
    }),
    deselected: (i: number) => ({
      opacity: 1,
      transition: {
        stagger: 0.033 * i,
      },
    }),
  };

  const changeFocusTitle = debounce((project?: Project) => {
    if (
      focusedProject &&
      selectedProject &&
      focusedProject.name == selectedProject.name
    )
      return;
    controls
      .start("exit")
      .then(() => setFocusedProject(project))
      .then(() => setTimeout(() => controls.start("animate"), 166));
  }, 350);

  const changeSelectedProject = (project?: Project) => {
    clickedProject.current = project || selectedProject;
    const variant = project ? "selected" : "deselected";
    if (project) {
      setSelectedProject(project);
      controls.start(variant);
    } else {
      setSelectedProject(project);
      controls.start(variant).then(() => (clickedProject.current = undefined));
      changeFocusTitle();
    }
  };

  const TextBody = (props: { className?: string }) => (
    <motion.div
      layoutId="arrow"
      className={cn(
        "flex flex-col z-10 absolute mix-blend-lighten w-g-x-3",
        props.className
      )}
    >
      <BackButton
        onClick={() => changeSelectedProject()}
        className={cn(
          "top-0 -translate-y-full absolute left-0 opacity-0 bg-[--sage-a5] hover:bg-[--sage-a3]",
          {
            "opacity-100 ": selectedProject,
          }
        )}
      />
      <ProjectTitle
        title={focusedProject?.name || selectedProject?.name || "Projects."}
      />
      <Text
        size={"2"}
        className={cn("z-10", {
          "w-full": selectedProject,
          "w-g-x-2": !selectedProject,
        })}
      >
        {DEFAULT_TEXT}
      </Text>
    </motion.div>
  );

  return (
    <TitleCard
      {...rest}
      containerClassName={className}
      className={cn(
        "flex-col flex relative w-g-x-5 h-g-y-6-2/8 p-4 py-g-y-2/8"
      )}
      title={CARD_TYPES.Projects}
      // animate={controls}
      ref={projectsRef}
      initial="initial"
      id={CARD_TYPES.Projects}
      key={CARD_TYPES.Projects}
    >
      <LayoutGroup>
        <Track
          className={cn("gap-g-x-2/8", {
            "w-auto": selectedProject,
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
                "relative p-0 h-g-y-2-2/8 w-g-x-2-6/8 overflow-hidden group cursor-pointer duration-300 rounded-sm"
              )}
              onHoverStart={() => changeFocusTitle(project)}
              onClick={() => !dragRef.current && changeSelectedProject(project)}
              variants={{
                ...cardTransition,
              }}
            >
              <Image
                className={cn(
                  "track-img object-cover h-full w-full",
                  "transition-all duration-500 brightness-50 group-hover:blur-none group-hover:brightness-75",
                  {
                    "brightness-90":
                      selectedProject && project.name == selectedProject.name,
                  }
                )}
                src={project.image}
                draggable={false}
                alt="project image"
                width={500}
                height={400}
              />
            </motion.div>
          ))}
        </Track>
        <TextBody className="bottom-g-y-6/8 left-g-x-2/8" />
      </LayoutGroup>
    </TitleCard>
  );
}
