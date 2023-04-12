import useStore from "@src/store";
import { useCallback, useEffect, useState } from "react";
import cn from "classnames";
import { Tab } from "@headlessui/react";
import { cx } from "@vechaiui/react";
import { pageRef, updateScrollProgress} from "./helper";
import anime, { AnimeParams } from "animejs";
import { debounce } from "lodash";

const convertDate = (date: string) => {
    return new Date(date).toLocaleDateString('default', {month: "long", year: "numeric"})
}

const handleProgressChange = debounce((index, activeWork, callback) => {
  if(index !== activeWork){
    callback();
  }
}, 50, {leading: true});

export default function Work(props: HTMLProps<HTMLDivElement>) {

    const [activeWork, setActiveWork] = useState<number>(0);
    
    const {containerRef: intersectRef, containerCallback: intersectCallback} = pageRef();
    const {containerRef, containerCallback} = updateScrollProgress(intersectRef, intersectCallback);
    const { works, activePage, pages, progress } = useStore();

    const THRESHOLD = 1/works.length

    const tabAnimation = (configs: AnimeParams) => anime({
      targets: `.tabPanel`,
      opacity: [1, 0],
      easing: "linear",
      duration: 250,
      ...configs
    })



    useEffect(() => {
      if(pages[activePage] === "Work"){ 
        const index = Math.floor(progress/THRESHOLD)
        handleProgressChange(index, activeWork, () => setActiveWork(index))
      }
    },[progress])

    const handleTabChange = (index:number) => {
      tabAnimation({
        complete: () => {
          setActiveWork(index);
          setTimeout(() => {
            tabAnimation({
              opacity: [0, 1]
            })
          }, 200);
        },
      })
    }

    const renderWork = (work) => {
        return <Tab.Panel className="w-full flex flex-col gap-8 mainText transition-all " 
        key={work.companyName}
        value={work.companyName}>
            {work.experiences.map((experience, i) => 
                <div className="flex flex-col gap-3 px-4" key={i}>
                    <h1 className="text-4xl text-muted">{experience.title}<span className="text-foreground"> @ {work.companyName}</span></h1>
                    <p className="text-3xl text-muted">{convertDate(experience.from)} - {convertDate(experience.to)}</p>
                    <div className="text-2xl w-full px-4">
                        {experience.descriptions.map((desc, j) => 
                        <p className="w-full" key={`exp${i}-${j}`}> · {desc}</p>)}
                    </div>
                </div>
                )}
        </Tab.Panel>
    }

    return <div className="h-[300vh] bg-base/10 relative mt-40" id="work" {...props} ref={containerCallback}>
    <Tab.Group as="div" 
      className="sticky h-[70vh] bg-base/10 flex flex-col gap-5 px-4 top-[15%]" 
      selectedIndex={activeWork} 
      onChange={handleTabChange}
    >
    <h1 className="text-7xl relative left-0 w-full flex items-center gap-10">
            Work
            <div className="h-[2px] w-1/3 bg-foreground" />
        </h1>
        <Tab.List
          className={cx(
            "flex font-works gap-1",
          )}
        >
          {works.map((work, i) => (
            <Tab
              key={work.companyName}
              value={work.companyName}
              className={cx(
                "text-xl px-12 py-4 hover:border-foreground hover:brightness-100 border-2 transition-all border-transparent brightness-75",
                "selected:border-foreground selected:bg-fill/30 selected:brightness-110",
              )}
            >
              {work.companyName}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="tabPanel flex-1 overflow-y-auto">
          {works.map((work) => (
              renderWork(work)
          ))}
        </Tab.Panels>
      </Tab.Group>
</div>
}