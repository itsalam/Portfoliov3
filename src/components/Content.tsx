import { forwardRef, useEffect, useRef } from 'react';
import cn from 'classnames';
import Home from '../pages/Home';
import Contact from '../pages/Contact';
import ProjectsPage from '../pages/Projects';
import Work from '../pages/Work';
import Menu from './Menu';

function Content() {
    const Projects = forwardRef((props, ref) => (
        <ProjectsPage {...{ props }} ref={ref} />
    ));
    const pageRefs = new Array(2).map(() => useRef<HTMLDivElement>(null));

    return (
        <div className="flex justify-center items-start z-10 pb-96">
            <div
                className={cn(
                    'flex gap-10 2xl:w-7/12 xl:w-9/12 sm:w-11/12 w-full transition-[width] max-w-screen-xl xl:px-10',
                    'flex-col'
                )}
            >
                <Menu />
                <div className="flex flex-col w-full px-4 gap-[20vh]">
                    <Home />
                    <Projects />
                    <Work />
                    <Contact />
                </div>
            </div>
        </div>
    );
}

export default Content;
