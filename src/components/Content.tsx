import { forwardRef, useEffect, useRef } from "react";
import Home from "../pages/Home";
import Contact from "../pages/Contact";
import ProjectsPage from "../pages/Projects";
import Work from "../pages/Work";
import Menu from "./Menu";

function Content(){

    const Projects = forwardRef((props, ref) => <ProjectsPage {...{props}} ref={ref}/>)
    const pageRefs = new Array(2).map(() => useRef<HTMLDivElement>(null));

    return <div className="flex justify-center items-start z-10 pb-96">
        <div className="flex gap-10 2xl:w-7/12 xl:w-9/12 lg:w-11/12 sm:w-11/12 transition-[width] max-w-screen-xl px-10">
            <Menu/>
            <div className="flex flex-col w-full px-5 gap-[20vh]">
                <Home/>
                <Projects/>
                <Work/>
                <Contact/>
            </div>
        </div>
    </div>; 
}

export default Content;