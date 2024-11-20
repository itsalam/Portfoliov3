"use client";

import { AnimatedText, MotionText } from "@/components/motion/TextEffects";
import { useScrollMask } from "@/lib/hooks";
import { useBreakpoints } from "@/lib/providers/breakpoint";
import { GridContext } from "@/lib/providers/clientState";
import { isWebGLSupported } from "@/lib/providers/clientUtils";
import { Project } from "@/lib/providers/fetchData";
import { CMSContext } from "@/lib/providers/state";
import { cn } from "@/lib/utils";
import { urlForImage } from "@/sanity/lib/image";
import { Badge, Separator } from "@radix-ui/themes";
import { AnimatePresence, m, useInView } from "framer-motion";
import { debounce } from "lodash";
import { ArrowLeft, ArrowRight, Github, Link, X } from "lucide-react";
import Image from "next/image";
import {
  ComponentProps,
  FC,
  forwardRef,
  ReactNode,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useStore } from "zustand";
import { Button } from "../Buttons/Button";
import Track from "../Track";
import { TickerText } from "../motion/TickerText";
import BaseCard from "./BaseCard";
import { CARD_TYPES } from "./types";
const MotionBadge = m(Badge);
const MImage = m(Image);

const DEFAULT_TEXT = "Scroll or drag to navigate.";

const ImageComponent = ({
  src,
  alt,
  className,
  ...props
}: ComponentProps<typeof MImage>) => {
  return (
    <MImage
      priority
      className={cn(
        "track-img data-[loaded=false]:animate-pulse",
        "data-[loaded=false]:animate-pulse",
        "aspect-video h-full w-full", // sizing
        "data-[loaded=false]:bg-gray-100/10 object-cover", // background, object
        "contrast-75 saturate-150", // filters
        className
      )}
      src={src}
      alt={alt}
      width={1600}
      height={900}
      data-loaded="false"
      onLoad={(event) => {
        event.currentTarget.setAttribute("data-loaded", "true");
      }}
      // placeholder="blur"
      {...props}
    />
  );
};

const SubCard = forwardRef<
  HTMLDivElement,
  { project: Project; index?: number } & ComponentProps<typeof m.div>
>(({ project, className, index = 0, ...props }, ref) => {
  return (
    <BaseCard
      title={project.name}
      animate={"animate"}
      layoutId={`selected-project-${project._id}-${index}`}
      layout="preserve-aspect"
      exit={{
        opacity: 0,
      }}
      className={className}
      ref={ref}
      {...props}
    >
      <ImageComponent
        src={urlForImage(project.thumbnails[index])}
        variants={{
          focused: {
            opacity: 1,
            objectFit: "cover",
          },
        }}
        alt="project image"
      />
    </BaseCard>
  );
});

SubCard.displayName = "SubCard";

const TrackCard = ({
  containerRef,
  callBack,
  ...props
}: {
  containerRef?: RefObject<HTMLDivElement>;
  callBack?: () => void;
} & ComponentProps<typeof SubCard>) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    root: containerRef,
    amount: "some",
    margin: "-48% 0% -48% 0%",
  });

  useEffect(() => {
    if (inView && callBack) {
      callBack();
    }
    return () => {};
  }, [inView, callBack]);

  const Card = useCallback(
    (props: ComponentProps<typeof SubCard>) => (
      <SubCard
        variants={{
          animate: {
            opacity: [null, 1],
            x: [null, -16],
            rotateY: [null, -10],
            rotateX: [null, 3],
            z: [null, -40],
          },
          focused: {
            rotateY: [null, 0],
            rotateX: [null, 0],
            opacity: [null, 1],
            x: [null, -8],
            z: [null, 0],
          },
        }}
        initial={{
          opacity: 0,
          x: -400,
          z: -40,
          originX: "50%",
          originY: "50%",
        }}
        whileHover={"focused"}
        ref={ref}
        {...props}
      />
    ),
    []
  );
  return <Card {...props} animate={inView ? "focused" : "animate"} />;
};

export default function ProjectsCard(props: ComponentProps<typeof m.div>) {
  const gridContext = useContext(GridContext);
  const { ...rest } = props;
  const projectsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const breakpoint = useBreakpoints();
  const isSmall = breakpoint === "xs" || breakpoint === "sm";
  const webgl = isWebGLSupported();
  const hasScrolled = useRef<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      hasScrolled.current = true;
    };

    const refCurrent = projectsRef.current;
    if (refCurrent) {
      refCurrent.addEventListener("scroll", handleScroll);
      refCurrent.addEventListener("wheel", handleScroll);
    }

    return () => {
      if (refCurrent) {
        refCurrent.removeEventListener("scroll", handleScroll);
        refCurrent.removeEventListener("wheel", handleScroll);
      }
    };
  }, [hasScrolled]);

  useScrollMask(projectsRef, "bottom", false);

  const cms = useContext(CMSContext)!;
  const projects = useStore(cms, (cms) => cms.projects ?? []);
  const { activeCard } = gridContext
    ? gridContext.getState()
    : { activeCard: null };

  const prevFocusedProject = useRef<number>();
  const focusedProject = useRef<number>(-1);
  const [selectedProject, setSelectedProject] = useState<number>(-1);
  const [titleText, setTitleText] = useState<{
    text: string;
    reverse: boolean;
  }>({ text: "Projects.", reverse: false });

  const changeFocusTitle = useRef(
    debounce(
      (projectIdx: number) => {
        if (focusedProject.current === projectIdx) return;
        prevFocusedProject.current = focusedProject.current;
        focusedProject.current = projectIdx;
        resolveTitle();
      },
      10,
      { trailing: true }
    )
  );

  const resolveTitle = useCallback(
    debounce(
      () => {
        if (!hasScrolled.current) return;
        const curFocusedProject = focusedProject.current;
        if (curFocusedProject >= 0 && curFocusedProject !== selectedProject) {
          setTitleText({
            text: projects[curFocusedProject]?.name || "Projects.",
            reverse: curFocusedProject > selectedProject,
          });
        } else if (selectedProject >= 0) {
          const project = projects[selectedProject];
          setTitleText({
            text: project?.name ?? "Projects.",
            reverse: false,
          });
        } else {
          setTitleText({
            text: "Projects.",
            reverse: true,
          });
        }
      },
      500,
      { trailing: true }
    ),
    [selectedProject]
  );

  const handleProjectHover = useCallback(
    (i: number) => () => {
      if (i < 0 && prevFocusedProject.current) {
        changeFocusTitle.current(prevFocusedProject.current);
      } else {
        changeFocusTitle.current(i);
      }
    },
    []
  );

  const changeSelectedProject = useCallback((i: number) => {
    setSelectedProject((curr) => (curr !== i ? i : -1));
  }, []);

  useEffect(() => {
    resolveTitle();
  }, [resolveTitle, selectedProject]);

  useEffect(() => {
    activeCard === CARD_TYPES.Projects && changeSelectedProject(-1);
  }, [activeCard, changeSelectedProject]);

  const ProjectThumbnails = useCallback(
    ({ project }: { project: Project }) => (
      <div
        className={cn(
          "top-0 bottom-0",
          isSmall ? "" : "sticky min-w-[25%] h-full",
          isSmall &&
            project.thumbnails.length > 1 &&
            "w-screen px-8 py-4 relative overflow-x-scroll -left-[5%]"
        )}
      >
        <m.div
          {...(isSmall
            ? {
                animate: { width: `${project.thumbnails.length * 100}%` },
              }
            : {})}
          className={cn(
            "flex flex-1 justify-center gap-8",
            isSmall ? "" : "flex-col h-[--card-height]"
          )}
        >
          <AnimatePresence>
            {project.thumbnails.map((_thumbnail, index) => (
              <SubCard
                project={project}
                index={index}
                className="md:h-auto flex aspect-video w-full flex-col"
                title={`${project.name}-${index + 1}`}
                animate={{ opacity: 1 }}
                key={`selected-project-image-${project._id}-${index + 1}`}
                initial={{ opacity: 0 }}
                exit={{ opacity: 0 }}
              />
            ))}
          </AnimatePresence>
        </m.div>
      </div>
    ),
    [isSmall]
  );

  const ProjectTitle = useCallback((
    props: Omit<ComponentProps<typeof AnimatedText>, "textChild">
  ) => {
    const Title: FC<{ className?: string; text: string }> = ({
      className,
      text,
    }) => (
      <MotionText
        size={"8"}
        className={cn(
          "w-full text-balance font-bold",
          className
        )}
        text={text}
      />
    );

    return <AnimatedText {...props} textChild={Title} />;
  }, []);

  const ProjectDescription = useCallback((props: { project: Project }) => {
    const { project } = props;

    return (
      <div
        key={"body"}
        className={cn(
          "flex w-full flex-col"
        )}
      >
        <MotionText
          className={cn(
            "w-inherit whitespace-normal"
          )}
          size={"5"}
          text={project?.description ?? DEFAULT_TEXT}
        />
        <AnimatePresence mode="wait">
          <div
            className={
              cn(
                "xs:py-2 relative flex flex-wrap gap-2"
              ) // overflowControl, padding
            }
          >
            {project &&
              project.stack.map((tech) => {
                return (
                  <MotionBadge
                    id={tech.name}
                    variant="surface"
                    key={tech.name}
                    color="gray"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{
                      opacity: [null, 1],
                      x: [null, 0],
                      // transition: {
                      //   delay: 0.3,
                      // },
                    }}
                    exit={{
                      opacity: 0,
                      x: 20,
                    }}
                  >
                    {tech.name}
                  </MotionBadge>
                );
              })}
          </div>

          {project?.fullDescription && (
            <>
              <Separator size="4" />
              <m.div
                className="py-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {project.fullDescription}
              </m.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }, []);

  const ProjectTrack = useCallback(({
    clickedProject,
    children,
  }: {
    clickedProject: number;
    children: ReactNode;
  }) => {
    return (
      <Track
        className={cn(
          "flex h-full flex-1 gap-g-4/8"
        )}
        trackRef={trackRef}
        clickedIndex={clickedProject}
        ref={containerRef}
      >
        {children}
      </Track>
    );
  }, []);

  const UrlNalBar: FC<{ project: Project; className?: string }> = useCallback(
    ({ className }) => {
      const iconSize = isSmall ? 12 : 14;
      return (
        <div>
          <m.div
            className={cn(
              "w-min-[100px]",
              "flex items-center rounded-full", // sizing, layout, border
              "bg-[--gray-2] p-2", // background, padding
              isSmall ? "py-0.5 h-10 gap-1 mt-2" : "my-4 h-12 py-2 gap-2",
              className
            )}
            animate={{
              width: ["0%", "100%"],
              opacity: [0, 1],
              transition: { duration: 0.5 },
            }}
          >
            <Button
              className={cn(
                "flex-0 w-auto",
                isSmall ? "p-0.5 h-5" : "h-full p-1"
              )}
              disabled={selectedProject === 0}
              onClick={() => changeSelectedProject(selectedProject - 1)}
            >
              <ArrowLeft size={iconSize} />
            </Button>
            <Button
              className={cn(
                "flex-0 w-auto",
                isSmall ? "p-0.5 h-5" : "h-full p-1"
              )}
              disabled={selectedProject === projects.length - 1}
              onClick={() => changeSelectedProject(selectedProject + 1)}
            >
              <ArrowRight size={iconSize} />
            </Button>
            <Button
              className={cn(
                "flex-0 w-auto",
                isSmall ? "p-0.5 h-5" : "h-full p-1"
              )}
              onClick={() => changeSelectedProject(-1)}
            >
              <X size={iconSize} />
            </Button>
            <m.div
              className={cn(
                "m-0.5", // margin
                "flex basis-full items-center", // sizing, flexboxGrid, layout
                "overflow-x-hidden whitespace-nowrap", // overflowControl, textWrapping
                "rounded-full bg-[--gray-4] px-2", // border, background, padding
                isSmall ? "text-xs py-1" : "text-sm py-1"
              )}
            >
              <TickerText className="overflow-x-hidden">
                {[
                  projects[selectedProject]?.link,
                  projects[selectedProject]?.githublink,
                ]
                  .filter(Boolean)
                  .map((link, index) => {
                    return (
                      <a
                        key={index}
                        href={link}
                        className={cn(
                          "flex", // sizing
                          "items-center gap-1 px-2", // layout, padding
                          "hover:text-[--accent-10] hover:underline" // textStyles
                        )}
                      >
                        {!(index % 2) ? (
                          <Link size={12} />
                        ) : (
                          <Github size={12} />
                        )}{" "}
                        {link}
                      </a>
                    );
                  })}
              </TickerText>
            </m.div>
          </m.div>
        </div>
      );
    },
    [changeSelectedProject, isSmall, projects, selectedProject]
  );

  const Body = useCallback(
    ({
      projects,
      titleText,
      selectedProject,
    }: {
      projects: Project[];
      titleText: { text: string; reverse: boolean };
      selectedProject: number;
    }) => (
      <>
        <div
          key={"body"}
          className={cn(
            "top-0 left-0 flex flex-1 flex-col justify-center",
            isSmall
              ? "w-full px-4 gap-2"
              : "sticky max-w-[50%] h-[--card-height] gap-4 pl-8"
          )}
        >
          {selectedProject >= 0 && (
            <UrlNalBar project={projects[selectedProject]} />
          )}
          <div
            className={cn(
              "xs:flex-row flex justify-between gap-2 pr-8"
            )}
            style={{ perspective: "5cm" }}
          >
            <ProjectTitle {...titleText} />
          </div>
          <ProjectDescription project={projects[selectedProject]} />
        </div>
        {selectedProject >= 0 && (
          <ProjectThumbnails project={projects[selectedProject]} />
        )}
      </>
    ),
    [isSmall, UrlNalBar, ProjectTitle, ProjectDescription, ProjectThumbnails]
  );

  const FullTrackCard = useCallback(
    (props: ComponentProps<typeof TrackCard>) => <TrackCard {...props} />,
    []
  );

  return (
    <>
      <m.div
        {...rest}
        className={cn(
          "relative flex h-full w-full flex-1 justify-center"
        )}
        ref={projectsRef}
        onHoverEnd={() =>
          setTimeout(() => handleProjectHover(selectedProject)(), 1000)
        }
      >
        <ProjectTrack clickedProject={0}>
          <div
            className={cn(
              "flex w-full flex-1 justify-center",
              isSmall ? "" : "gap-8"
            )}
          >
            {!isSmall && (
              <>
                <Body
                  projects={projects}
                  titleText={titleText}
                  selectedProject={selectedProject}
                />
              </>
            )}
            <m.div
              style={webgl ? { perspective: "30cm" } : {}}
              className={cn(
                "flex h-max min-w-[20%] flex-col items-start py-12",
                isSmall
                  ? "w-[90%] gap-g-1 justify-center"
                  : "max-w-[50%] pr-8 gap-g-4/8",
                activeCard === CARD_TYPES.Projects &&
                  "my-[calc(var(--card-height)_/_5)]"
              )}
              ref={thumbnailContainerRef}
              animate={{
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.2,
                },
              }}
            >
              {projects.map((project, index) =>
                isSmall && index === selectedProject ? (
                  <div
                    className="flex w-full flex-col-reverse"
                    key={index}
                  >
                    <Body
                      projects={projects}
                      titleText={titleText}
                      selectedProject={selectedProject}
                    />
                  </div>
                ) : (
                  <FullTrackCard
                    containerRef={projectsRef}
                    project={project}
                    key={index}
                    className={cn(
                      "track-card group/track-card",
                      "aspect-video w-full origin-center", // sizing, transforms
                      "cursor-pointer", // interactions
                      isSmall ? "mx-g-1/8" : ""
                    )}
                    callBack={handleProjectHover(index)}
                    {...(webgl ? {} : { variants: {} })}
                    onMouseEnter={() => handleProjectHover(index)}
                    onMouseLeave={() => handleProjectHover(-1)}
                    onClick={() => changeSelectedProject(index)}
                  />
                ))}
            </m.div>
          </div>
        </ProjectTrack>
      </m.div>
    </>
  );
}
