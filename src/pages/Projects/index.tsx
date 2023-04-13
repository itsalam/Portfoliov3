import { AnimeTimelineInstance } from 'animejs';
import cn from 'classnames';
import React, { HTMLProps, useCallback } from 'react';
import { useEffect, useRef, useState } from 'react';
import useStore from '@src/store';
import { debounce } from 'lodash';
import {
    animateProject,
    animateProjectReverse,
    scrollAnimation
} from './animations';
import { getScrollProgress, isWide, pageRef, updateScrollProgress } from '../../etc/helper';

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

    const focusedRef = useRef<number>();

    const { containerRef: intersectRef, containerCallback: intersectCallback } =
        pageRef();
    const { containerRef, containerCallback } = updateScrollProgress(
        intersectRef,
        intersectCallback
    );

    focusedRef.current = focusedProj;

    const { imageBuilder, projects, setProgress } = useStore();
    const subProjects = new Array(5).fill(projects[0]);

    const toggleCentered = debounce(
        (event: any) => {
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
            className="relative py-32 flex flex-col flex-grow w-full items-center gap-20 projectTrack justify-center h-auto"
            ref={containerCallback}
            id="projects"
            {...props}
        >
            <h1 className="title relative left-0 w-full flex items-center gap-10">
                Projects
                <div className="h-[2px] w-1/3 bg-foreground" />
            </h1>
            {subProjects.map((project, i) => {
                const imgUrl = imageBuilder.image(project.thumbnails[0]).url();
                return (
                    <div
                        key={`p-${i}`}
                        onClick={(e) => onProjectClick(e, i)}
                        className={cn(
                            'snap-center transition md:h-[30vh] relative project rounded-md shadow-md flex hover:bg-fill/20 bg-base/10 hover:opacity-100',
                            'xl:w-10/12 md:p-4 md:gap-6',
                            'flex-col xl:flex-row',
                            { right: i % 2 === 0, left: i % 2 === 1, wide: isWide() }
                        )}
                    >
                        <img
                            src={`https://source.unsplash.com/random/800x1600sig=${i}`}
                            className={cn(
                                'xl:w-1/4 object-cover object-center rounded-md z-10',
                                'md:min-w-[14rem]',
                                'w-full'
                            )}
                        />
                        <div
                            className={cn(
                                'cursor-pointer flex flex-col md:py-10 py-4 justify-center md:w-3/4 px-4 xl:px-0 xl:h-auto h-32',
                                {
                                    'xl:items-start xl:right-0': i % 2 === 0,
                                    'xl:items-end xl:text-end xl:left-0': i % 2 === 1
                                }
                            )}
                        >
                            <div className="revealer flex-shrink-0 ">
                                <h1 className="subTitle">{project.name}</h1>
                            </div>
                            <div className="revealer flex-shrink-0">
                                <p className="subText description">
                                    {project.description}
                                </p>
                            </div>
                            <div className="h-[1px] w-[95%] bg-foreground my-3" />
                            <div className="revealer fullDescription flex-shrink-1 h-0 opacity-0">
                                <div className="subText absolute ">
                                    <p>{project.fullDescription}</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute w-1/3 transition-all h-screen 2md:-right-[3%] md:-right-[5%] -right-[7%] translate-x-full -top-[28vh] opacity-0 carousel flex flex-col gap-5">
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
