import anime, { AnimeAnimParams, AnimeTimelineInstance } from "animejs";
import cn from "classnames";
import React, { HTMLProps, useCallback } from "react";
import { useEffect, useRef, useState } from "react";
import useStore from "@src/store";
import { debounce } from "lodash";
import { animateProject, animateProjectReverse, scrollAnimation } from "./animations";
import { getScrollProgress, pageRef, updateScrollProgress } from "../helper";


const getScrollPercentage = (ref: HTMLDivElement) => {
    const rect = ref.getBoundingClientRect();
    return Math.max(0, window.innerWidth / 2 - rect.y) / rect.height;
}

const isElementCentered = (e: Element) => {
    const rect = e.getBoundingClientRect();
    return window.innerHeight / 2 > rect.top && (window.innerHeight / 2 - rect.top) < rect.height
}

export default function Projects(props: HTMLProps<HTMLDivElement>) {
    const [focusedProj, setFocusedProj] = useState<number>()
    const [focusedAni, setFocusedAni] = useState<AnimeTimelineInstance>();
    const [centeredElem, setCenteredElem] = useState<Element>();
    
    const focusedRef = useRef<number>();
    
    const {containerRef: intersectRef, containerCallback: intersectCallback} = pageRef();
    const {containerRef, containerCallback} = updateScrollProgress(intersectRef, intersectCallback);

    focusedRef.current = focusedProj;

    const { imageBuilder, projects, setProgress } = useStore();
    const subProjects = new Array(5).fill(projects[0]);

    const toggleCentered = debounce((event: any) => {
        if (containerRef.current) {
            const centeredElem = Array.from(containerRef.current?.children).find(isElementCentered);
            setCenteredElem(centeredElem)
        }
    }, 100, { trailing: true, leading: false });

    useEffect(() => {
        addEventListener("scroll", toggleCentered);
    })

    useEffect(() => {
        document.querySelector(".centered")?.classList.toggle("centered", false)
        centeredElem?.classList.toggle("centered", true)
    }, [centeredElem])

    useEffect(() => {
        if (focusedProj !== undefined) setFocusedAni(animateProject(focusedProj))
    }, [focusedProj])

    const scrollToMiddle = (e: Element, i: number) => {
        const elementRect = e.getBoundingClientRect();
        let absoluteElementTop = window.pageYOffset;
        if  (focusedProj === i){
            absoluteElementTop += (elementRect.bottom + elementRect.top)/2;
        } 
        else if (focusedProj === undefined || focusedProj > i) {
            absoluteElementTop += elementRect.bottom;
        } else {
            absoluteElementTop += elementRect.top;
        }
        const middle = absoluteElementTop - window.innerHeight/2;
        window.scrollTo(0, middle);
    }

    const onProjectClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, i: number) => {
        const lastFocusedElem = document.querySelector(".focused");
        const elem = (e.currentTarget as Element);
        lastFocusedElem?.classList.toggle("focused", false);
        scrollToMiddle(elem, i);
        elem.classList.toggle("focused", i !== focusedProj)
        if (focusedProj !== undefined) {
            focusedAni?.pause();
            animateProjectReverse(focusedProj);
        }
        setFocusedProj(i === focusedProj ? undefined : i);
    }

    return <div className="relative py-32 flex flex-col flex-grow w-full items-center gap-20 projectTrack justify-center h-auto" ref={containerCallback} id="projects" {...props}>
        <h1 className="text-7xl relative left-0 w-full flex items-center gap-10">
            Projects
            <div className="h-[2px] w-1/3 bg-foreground"/>
        </h1>
        {
            subProjects.map((project, i) => {
                const imgUrl = imageBuilder.image(project.thumbnails[0]).url()
                return <div key={`p-${i}`}
                    onClick={(e) => onProjectClick(e, i)}
                    className={cn("snap-center transition h-[30vh] relative project w-8/12 rounded-md shadow-xl flex hover:bg-fill/20 bg-base/10 hover:opacity-100 gap-6 px-4 py-4", { "right": i % 2 === 0, "left": i % 2 === 1 })} >
                    <img src={`https://source.unsplash.com/random/800x1600sig=${i}`} className={cn("w-1/4 min-w-[14rem] h-full object-cover object-center rounded-xl z-10")} />
                    <div className={cn("cursor-pointer flex flex-col py-10 h-full justify-center w-3/4", { "items-start right-0": i % 2 === 0, "items-end text-end left-0": i % 2 === 1 })}>
                        <div className="revealer flex-shrink-0">
                            <h1 className="subTitle text-4xl">{project.name}</h1>
                        </div>
                        <div className="revealer flex-shrink-0">
                            <p className="mainText text-2xl description">{project.description}</p>
                        </div>
                        <div className="h-[1px] w-full bg-foreground my-3" />
                        <div className="revealer fullDescription flex-shrink-1 h-0">
                            <div className="mainText text-2xl absolute">
                                <p>{project.fullDescription}</p>
                            </div>
                        </div>
                    </div>
                    <div className="absolute w-1/3 transition-all h-screen 2xl:-right-[3%] lg:-right-[5%] -right-[7%] translate-x-full -top-[28vh] opacity-0 carousel flex flex-col gap-5">
                            {[...Array(4).keys()].map((i) => {
                                return <img key={i} src={`https://source.unsplash.com/random/1200x800sig=${i}`} className={cn("flex-1 h-full object-left object-cover rounded-xl goddamn")} />
                            })}
                    </div>
                </div>
            })}
    </div>
}