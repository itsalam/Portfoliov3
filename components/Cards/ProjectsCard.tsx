"use client";

import { AnimateText, AnimatedText } from "@/components/motion/TextEffects";
import { GridContext } from "@/lib/clientState";
import { Project } from "@/lib/fetchData";
import { CMSContext } from "@/lib/state";
import { cn } from "@/lib/utils";
import { urlForImage } from "@/sanity/lib/image";
import { Badge, Separator } from "@radix-ui/themes";
import { AnimatePresence, m } from "framer-motion";
import { debounce } from "lodash";
import { ArrowLeft, ArrowRight, Github, Link } from "lucide-react";
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
import { Button } from "../Buttons/Button";
import Track from "../Track";
import Modal from "../motion/Modal";
import { TickerText } from "../motion/TickerText";
import Card from "./HomeCard";
const MotionBadge = m(Badge);
const MImage = m(Image);

export default function ProjectsCard(props: ComponentProps<typeof m.div>) {
  const { ...rest } = props;
  const projectsRef = useRef(null);
  const prevFocusedProject = useRef<number>();
  const [focusedProject, setFocusedProject] = useState<number>(-1);
  const [selectedProject, setSelectedProject] = useState<number>(-1);
  const [clickedProject, setClickedProject] = useState<number>(-1);
  const dragRef = useRef(false);
  const cms = useContext(CMSContext)!;
  const projects = useStore(cms, (cms) => cms.projects ?? []);
  const activeCard = useContext(GridContext)?.getState().activeCard;

  useEffect(() => {
    changeSelectedProject(-1);
  }, [activeCard])

  const ProjectCard = useCallback(
    ({
      project,
      // className,
      ...props
    }: { project: Project } & ComponentProps<typeof m.div>) => (
      <Card
        title={project.name}
        animate={"animate"}
        layoutId={`selected-project-${project._id}`}
        // layout="position"
        transition={{ layout: { duration: 0.3 } }}
        {...props}
      />
    ),
    []
  );

  const ModalCard = useCallback(({ project }: { project: Project }) =>
    <ProjectCard
      project={project}
      className="min-h-[66%] md:h-auto h-full"
      animate={{ opacity: 1 }}>
      <div
        className={cn(
          "flex max-h-full container w-full h-full", // sizing
          "overflow-y-scroll bg-[--gray-4]" // overflowControl, background
        )}
      >
        <div
          key={"body"}
          className={cn(
            "flex w-full flex-1 flex-col p-4"
          )}
        >
          <div
            className={cn(
              "xs:flex-row flex flex-col justify-between gap-2 pr-4"
            )}
          >
            <ProjectTitle
              text={projects[focusedProject]?.name || project?.name || "Projects."}
              reverse={!focusedProject}
            />
          </div>
          <ProjectDescription
            text={project?.description ?? DEFAULT_TEXT}
            reverse={!project}
          />
          <div className="xs:py-2 relative flex flex-wrap gap-2 p-0 overflow-y-auto">
            <AnimatePresence mode="wait">
              {project &&
                project.stack.map((tech) => {
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
            </AnimatePresence>
          </div>
          <Separator size="4" />
          <div className="py-2">
            {project.fullDescription}
          </div>


        </div>
        <div className="relative flex w-1/2 flex-col gap-4 p-4">
          <MImage
            priority
            // layout="position"
            layoutId={`selected-project-image-${project._id}`}
            className={cn(
              "track-img",
              "aspect-video w-full object-cover", // sizing, object
              "contrast-75 saturate-150", // filters
              "transition-all duration-300" // transitionsAnimations
            )}
            src={urlForImage(project.thumbnails[0])}
            draggable={false}
            alt="project image"
            width={1600}
            height={900}
          />
          {project.thumbnails.slice(1).map((thumbnail, index) => (
            <Image
              className={cn(
                "track-img",
                "aspect-video w-full object-cover", // sizing, object
                "contrast-75 saturate-150", // filters
                "transition-all duration-300" // transitionsAnimations
              )}
              src={urlForImage(thumbnail)}
              draggable={false}
              alt="project image"
              width={1600}
              height={900}
              key={`selected-project-image-${project._id}-${index + 1}`}
            />
          ))}
        </div>
      </div>
    </ProjectCard>, [selectedProject]);

  const DEFAULT_TEXT = "Scroll or drag to navigate.";
  const ProjectTitle = useCallback((
    props: Omit<ComponentProps<typeof AnimatedText>, "textChild">
  ) => {
    const Title: FC<{ className?: string; text: string }> = ({
      className,
      text,
    }) => (
      <AnimateText
        size={"8"}
        className={cn(
          "w-full text-balance font-bold",
          className
        )}
        // layoutId="projDesc"
        text={text}
      />
    );

    return <AnimatedText {...props} textChild={Title}

    // layoutId="projDesc"
    />;
  }, []);

  const ProjectDescription = useCallback((
    props: Omit<ComponentProps<typeof AnimatedText>, "textChild">
  ) => {
    const Text: FC<{ className?: string; text: string }> = ({
      className,
      text,
    }) => (
      <AnimateText
        className={cn(
          "w-inherit whitespace-normal",
          className
        )}
        size={"5"}
        text={text}
      />
    );
    return <AnimatedText {...props} textChild={Text} />;
  }, []);

  const changeFocusTitle = debounce(
    (projectIdx: number) => {
      setFocusedProject((prevProj) => {
        prevFocusedProject.current = prevProj;
        return projectIdx;
      });
    },
    600,
    { trailing: true, leading: true, maxWait: 600 }
  );

  const changeSelectedProject = useCallback(
    (projectIdx: number) => {
      setClickedProject(projectIdx);
      setSelectedProject(projectIdx);
    },
    [projects]
  );

  const handleProjectHover = (projectIdx: number) => () => {
    if (focusedProject >= 0 && focusedProject !== selectedProject)
      changeFocusTitle(projectIdx);
    else if (!(selectedProject >= 0 && projectIdx === selectedProject))
      changeFocusTitle(projectIdx);
  };

  const ProjectTrack = useCallback(({ clickedProject }: { clickedProject: number }) => {
    return <Track
      className={cn(
        "xs:h-2/3 xs:w-full", "flex h-1/2 max-h-[50dvh] w-screen gap-g-2/8" // sizing, layout
      )}
      dragRef={dragRef}
      clickedIndex={clickedProject}

    >
      {projects.map((project, index) => (
        <ProjectCard
          project={project}
          key={index}
          className={cn(
            "card track-card group/track-card",
            "aspect-video h-full min-w-[200px]", // basicStyles, sizing
            "cursor-pointer" // interactions
          )}
          onMouseEnter={handleProjectHover(index)}
          onClick={() => changeSelectedProject(index)}
        >
          <MImage
            className={cn(
              "track-img blur-xs",
              "h-full object-cover opacity-50 hover:opacity-100", // sizing, object, transparency
              "group-hover/track-card:blur-none contrast-75 saturate-150", // filters
              "transition-all duration-300", // transitionsAnimations
              {
                "blur-none":
                  project.name == projects[focusedProject]?.name ||
                  project.name == projects[selectedProject]?.name,
              }
            )}
            src={urlForImage(project.thumbnails[0])}
            draggable={false}
            alt="project image"
            width={1600}
            height={900}
          />
        </ProjectCard>
      ))}
    </Track>
  }, [])

  return (
    <>
      <Modal
        isOpen={selectedProject >= 0}
        target={document.getElementById("main") ?? undefined}
        onClose={() => setSelectedProject(-1)}
      >
        <m.div className="flex gap-2 p-2 bg-[--gray-2] rounded-full w-min-[100px]" animate={{ width: ["0%", "50%"], opacity: [0, 1] }}>
          <Button className="h-full w-auto p-1 flex-0"
            disabled={selectedProject === 0}
            onClick={() => changeSelectedProject(selectedProject - 1)}
          >
            <ArrowLeft size={14} />
          </Button>
          <Button className="h-full w-auto p-1 flex-0"
            disabled={selectedProject === projects.length - 1}
            onClick={() => changeSelectedProject(selectedProject + 1)}>
            <ArrowRight size={14} />
          </Button>
          <m.div
            className={cn("p-1 bg-[--gray-4] rounded-full text-sm px-2 overflow-x-hidden whitespace-nowrap flex basis-full")}>
            <TickerText className="overflow-x-hidden">

              {[projects[selectedProject]?.link, projects[selectedProject]?.githublink].filter(Boolean).map((link, index, arr) => {
                return <a href={link} className="flex gap-1 items-center px-2 hover:underline hover:text-[--accent-10]">
                  {!(index % 2) ? <Link size={12} /> : <Github size={12} />} {link}
                </a>
              })}
            </TickerText>
          </m.div>
        </m.div>

        <ModalCard project={projects[selectedProject]} />
      </Modal>
      <m.div
        {...rest}
        className={cn(
          "-z-10 flex h-full flex-1 flex-col gap-2 py-4"
        )}
        ref={projectsRef}
        onHoverEnd={() =>
          setTimeout(() => handleProjectHover(selectedProject)(), 1000)
        }
      >
        <ProjectTrack clickedProject={clickedProject} />
        <m.div
          // layoutId="projDesc"
          key={"body"}
          className={cn(
            "xs:px-8 bottom-0 left-0 flex w-full flex-1 flex-col p-2",
            props.className
          )}
        >
          <div
            className={cn(
              "xs:flex-row flex flex-col justify-between gap-2 pr-4"
            )}
          >
            <ProjectTitle
              text={projects[focusedProject]?.name || "Projects."}
              reverse={!focusedProject}
            />
          </div>
          <ProjectDescription
            text={DEFAULT_TEXT}
            reverse={!selectedProject}
          />
        </m.div>
      </m.div>
    </>
  );
}
