"use client";

import { AnimateText, AnimatedText } from "@/components/motion/TextEffects";
import { Project } from "@/lib/fetchData";
import { CMSContext } from "@/lib/state";
import { cn } from "@/lib/utils";
import { urlForImage } from "@/sanity/lib/image";
import { Badge } from "@radix-ui/themes";
import {
  AnimatePresence,
  MotionStyle,
  Variants,
  motion,
  useAnimationControls,
} from "framer-motion";
import { debounce } from "lodash";
import { Github } from "lucide-react";
import Image from "next/image";
import {
  ComponentProps,
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useStore } from "zustand";
import { BackButton } from "../Buttons/BackButton";
import { LinkButton } from "../Buttons/LinkButton";
import Track from "../Track";

const MotionBadge = motion(Badge);
const GithubBadge = motion(Github);

export default function ProjectsCard(props: ComponentProps<typeof motion.div>) {
  const { ...rest } = props;
  const projectsRef = useRef(null);
  const trackControls = useAnimationControls();
  const prevFocusedProject = useRef<Project>();
  const [focusedProject, setFocusedProject] = useState<Project>();
  const [selectedProject, setSelectedProject] = useState<Project>();
  const clickedProject = useRef<number>(-1);
  const dragRef = useRef(false);
  const cms = useContext(CMSContext)!;
  const projects = useStore(cms, (cms) => cms.projects ?? []);

  const DEFAULT_TEXT = "Scroll or drag to navigate.";
  const ProjectTitle = useCallback(
    (props: Omit<ComponentProps<typeof AnimatedText>, "textChild">) => {
      const Title: FC<{ className?: string; text: string }> = ({
        className,
        text,
      }) => (
        <AnimateText
          size={"8"}
          className={cn("w-min font-bold", className)}
          text={text}
        />
      );

      return <AnimatedText {...props} textChild={Title} />;
    },
    []
  );

  const ProjectDescription = useCallback(
    (props: Omit<ComponentProps<typeof AnimatedText>, "textChild">) => {
      const Text: FC<{ className?: string; text: string }> = ({
        className,
        text,
      }) => (
        <AnimateText
          className={cn("w-inherit whitespace-normal", className)}
          size={"3"}
          text={text}
        />
      );
      return <AnimatedText {...props} textChild={Text} />;
    },
    []
  );

  const changeFocusTitle = debounce(
    (project?: Project) => {
      setFocusedProject((prevProj) => {
        prevFocusedProject.current = prevProj;
        return project;
      });
    },
    600,
    { trailing: true, leading: true, maxWait: 600 }
  );

  useEffect(() => {
    if (!selectedProject) {
      setFocusedProject(undefined);
    }
  }, [selectedProject]);

  const changeSelectedProject = useCallback(
    (project?: Project) => {
      clickedProject.current = projects.findIndex(
        (p) => p.name === project?.name
      );
      setSelectedProject(project);
    },
    [projects]
  );

  const handleProjectHover = (project?: Project) => () => {
    if (focusedProject && focusedProject !== selectedProject)
      changeFocusTitle(project);
    else if (!(selectedProject && project === selectedProject))
      changeFocusTitle(project);
  };

  return (
    <motion.div
      {...rest}
      className={cn(
        "relative flex h-full flex-1 flex-col justify-start gap-2 p-4"
      )}
      ref={projectsRef}
      onHoverEnd={() =>
        setTimeout(() => handleProjectHover(selectedProject)(), 1000)
      }
      variants={
        {
          expand: {
            "--card-width": [null, 6.0, 6.0],
            opacity: [null, 0, 1],
          },
          minimize: {
            "--card-width": [null, 3.5],
          },
        } as Variants
      }
      style={
        {
          "--card-width": 3.5,
          "--mask-height": selectedProject ? 0.1 : 0.0,
        } as MotionStyle
      }
    >
      <Track
        className={cn("h-2/3 gap-g-2/8")}
        dragRef={dragRef}
        animate={trackControls}
        clickedIndex={clickedProject}
      >
        {projects.map((project, index) => (
          <motion.div
            key={index}
            custom={index}
            className={cn(
              "track-card group",
              "relative h-full cursor-pointer", // basicStyles, sizing, interactions
              "overflow-hidden rounded-sm p-0", // overflowControl, border, padding
              "duration-300" // transitionsAnimations
            )}
            onHoverStart={handleProjectHover(project)}
            onTap={() => changeSelectedProject(project)}
            variants={{
              expand: {
                opacity: 0.25,
              },
              minimize: {
                opacity: 1.0,
              },
            }}
          >
            <Image
              className={cn(
                "track-img",
                "h-full w-full object-cover", // sizing, object
                "opacity-50 hover:opacity-100", // transparency
                "blur-sm group-hover:blur-none dark:brightness-90", // filters
                "brightness-75 contrast-75 dark:hover:brightness-100",
                "saturate-150",
                "transition-all duration-300", // transitionsAnimations
                {
                  "opacity-100 blur-none brightness-100":
                    project.name == focusedProject?.name ||
                    project.name == selectedProject?.name,
                }
              )}
              src={urlForImage(project.thumbnails[0])}
              draggable={false}
              alt="project image"
              width={500}
              height={400}
            />
          </motion.div>
        ))}
      </Track>
      <motion.div
        key={"body"}
        className={cn(
          "absolute bottom-0 left-0 flex w-full flex-col px-12 py-4",
          props.className
        )}
        layout
        layoutRoot
      >
        <motion.div className="flex justify-between gap-2 pr-4">
          <ProjectTitle
            text={focusedProject?.name || selectedProject?.name || "Projects."}
            reverse={!focusedProject}
          />
          <AnimatePresence>
            {selectedProject && (
              <div className="flex items-center gap-4">
                {selectedProject.link && (
                  <LinkButton
                    animate={{
                      opacity: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    href={selectedProject.link}
                  />
                )}
                {selectedProject.githublink && (
                  <LinkButton
                    animate={{
                      opacity: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    ComponentA={(props) => <GithubBadge {...props} />}
                    href={selectedProject.githublink}
                  />
                )}
                <BackButton
                  animate={{
                    opacity: 1,
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  onClick={() => changeSelectedProject()}
                />
              </div>
            )}
          </AnimatePresence>
        </motion.div>
        <ProjectDescription
          text={selectedProject?.description ?? DEFAULT_TEXT}
          reverse={!selectedProject}
        />
        <AnimatePresence mode="wait">
          <motion.div layout className="relative flex gap-2 p-4">
            {selectedProject &&
              selectedProject.stack.map((tech) => {
                return (
                  <MotionBadge
                    id={tech.name}
                    variant="surface"
                    key={tech.name}
                    color="gray"
                    animate={{
                      opacity: [0, 1],
                      y: [20, 0],
                      transition: {
                        delay: 0.3,
                      },
                    }}
                    exit={{
                      opacity: 0,
                      y: 20,
                    }}
                  >
                    {tech.name}
                  </MotionBadge>
                );
              })}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
