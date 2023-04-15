import { AnimeTimelineInstance } from 'animejs';
import cn from 'classnames';
import React, { HTMLProps } from 'react';
import { useEffect, useState } from 'react';
import useStore from '@src/store';
import { debounce } from 'lodash';
import {
    animateProject,
    animateProjectReverse
} from './animations';
import { isMobileListener, pageRef, updateScrollProgress } from '../../etc/helper';

const isElementCentered = (e: Element) => {
    const rect = e.getBoundingClientRect();
    // console.log(e);
    // console.log(rect, window.innerHeight);
    return (
        window.innerHeight / 2 > rect.top &&
        window.innerHeight / 2 - rect.top < rect.height
    );
};

export default function Projects(props: HTMLProps<HTMLDivElement>) {
    const [focusedProj, setFocusedProj] = useState<number>();
    const [focusedAni, setFocusedAni] = useState<AnimeTimelineInstance>();
    const [centeredElem, setCenteredElem] = useState<Element>();

    const { containerRef: intersectRef, containerCallback: intersectCallback } =
        pageRef();
    const { containerRef, containerCallback } = updateScrollProgress(
        intersectRef,
        intersectCallback
    );
    const isMobile = isMobileListener()

    const { projects } = useStore();
    const subProjects = new Array(5).fill(projects[0]);

    const toggleCentered = debounce(
        () => {
            if (containerRef.current) {
                const centeredElem = Array.from(containerRef.current?.children).find(
                    isElementCentered
                );
                setCenteredElem(centeredElem);
            }
        },
        100,
        { trailing: true, leading: false }
    );

    useEffect(() => {
        addEventListener('scroll', toggleCentered);
    });

    useEffect(() => {
        document.querySelectorAll('.project, .project *')?.forEach(elem => (elem as HTMLElement).setAttribute("style", ""));
    }, [isMobile]);

    useEffect(() => {
        document.querySelector('.centered')?.classList.toggle('centered', false);
        centeredElem?.classList.toggle('centered', true);
    }, [centeredElem]);

    useEffect(() => {
        if (focusedProj !== undefined) setFocusedAni(animateProject(focusedProj));
    }, [focusedProj]);

    const scrollToMiddle = (e: Element, i: number) => {
        const elementRect = e.getBoundingClientRect();
        let absoluteElementTop = window.pageYOffset;
        if (focusedProj === i) {
            absoluteElementTop += (elementRect.bottom + elementRect.top) / 2;
        } else if (focusedProj === undefined || focusedProj > i) {
            absoluteElementTop += elementRect.bottom;
        } else {
            absoluteElementTop += elementRect.top;
        }
        const middle = absoluteElementTop - window.innerHeight / 2;
        window.scrollTo(0, middle);
    };

    const onProjectClick = (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>,
        i: number
    ) => {
        const lastFocusedElem = document.querySelector('.focused');
        const elem = e.currentTarget as Element;
        lastFocusedElem?.classList.toggle('focused', false);
        scrollToMiddle(elem, i);
        elem.classList.toggle('focused', i !== focusedProj);
        if (focusedProj !== undefined) {
            focusedAni?.pause();
            animateProjectReverse(focusedProj);
        }
        setFocusedProj(i === focusedProj ? undefined : i);
    };

    return (
        <div
            className="projectTrack relative flex h-auto w-full grow flex-col items-center justify-center gap-20 py-32"
            ref={containerCallback}
            id="projects"
            {...props}
        >
            <h1 className="title relative left-0 flex w-full items-center gap-10">
                Projects
                <div className="bg-foreground h-[2px] w-1/3" />
            </h1>
            {subProjects.map((project, i) => {
                // const imgUrl = imageBuilder.image(project.thumbnails[0]).url();
                return (
                    <div
                        key={`p-${i}`}
                        onClick={(e) => onProjectClick(e, i)}
                        className={cn(
                            'snap-center transition md:h-[30vh] relative project rounded-md shadow-md flex hover:bg-fill/20 bg-base/10 hover:opacity-100',
                            'md:p-4 md:w-2/3',
                            'flex-col md:flex-row',
                            { right: i % 2 === 0, left: i % 2 === 1, mobile: isMobile }
                        )}
                    >
                        <img
                            src={`https://source.unsplash.com/random/800x1600sig=${i}`}
                            className={cn(
                                'md:w-1/4 object-cover object-center rounded-md z-10',
                                'md:min-w-[14rem]',
                                'w-full'
                            )}
                        />
                        <div
                            className={cn(
                                'cursor-pointer flex flex-col md:py-10 p-4 justify-center md:w-3/4 px-4  md:h-auto h-32',
                                {
                                    'md:items-start md:right-0': i % 2 === 0,
                                    'md:items-end md:text-end md:left-0': i % 2 === 1
                                }
                            )}
                        >
                            <div className="revealer shrink-0 ">
                                <h1 className="subTitle">{project.name}</h1>
                            </div>
                            <div className="revealer shrink-0">
                                <p className="subText description">
                                    {project.description}
                                </p>
                            </div>
                            <div className="bg-foreground my-3 h-[1px] w-full" />
                            <div className="revealer fullDescription shrink-1 h-0 opacity-0">
                                <div className="subText absolute ">
                                    <p>{project.fullDescription}</p>
                                </div>
                            </div>
                        </div>
                        <div className="carousel absolute right-[-7%] top-[-28vh] flex h-screen w-1/3 translate-x-full flex-col gap-5 opacity-0 transition-all md:right-[-5%]">
                            {[...Array(4).keys()].map((i) => {
                                return (
                                    <img
                                        key={i}
                                        src={`https://source.unsplash.com/random/1200x800sig=${i}`}
                                        className={cn(
                                            'flex-1 h-full object-left object-cover rounded-md goddamn'
                                        )}
                                    />
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
