import { useEffect, useRef, useState } from "react";
import useStore from "@src/store";
import anime from "animejs";

function ThemeSwitch({ darkMode, setDarkMode }) {
    const toggleRef = useRef(null);

    const sunIcon = <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />

    const moonIcon = <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />

    const sunClasses = ['bg-primary-700', 'text-white']
    const moonClasses = ['bg-primary-300/.5', "text-white-400", 'translate-x-full']

    function toggleTheme() {
        setTimeout(() => {
            setDarkMode(!darkMode);
        }, 250);
        toggleRef.current.classList.remove(...darkMode ? moonClasses : sunClasses)
        toggleRef.current.classList.add(...darkMode ? sunClasses : moonClasses)
    }

    return <button
        className={`w-12 h-7 p-1 rounded-full flex items-center transition duration-150 focus:outline-none shadow ${darkMode ? "bg-slate-600/15 hover:bg-primary-300/20" : "bg-slate-300/15 hover:bg-slate-300/40"}`}
        onClick={() => toggleTheme()}
    >
        <div ref={toggleRef}
            id="switch-toggle"
            className={"w-5 h-5 relative rounded-full transition duration-500 transform p-0.5 " + (darkMode ? moonClasses : sunClasses).join(" ")}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor" className="w-4 h-4">
                {darkMode ? moonIcon : sunIcon}
            </svg>
        </div>
    </button>
}

const titleLoop = () => {
    anime({
        targets: `#toolbar .titleContent>.homeTitle bn `,
        keyframes: [translateY(1), translateY(2)],
        easing: "easeOutQuart",
      })
  };

function Toolbar({ darkMode, setDarkMode }) {
    const { activePage, pages } = useStore();
    const [currPage, setCurrPage] = useState<number>();

    const animationVals = (isDownwards: false) => [["0%", `${isDownwards ?"" : "-"}100%`], [`${isDownwards ?"-" : ""}100%`, "0%"]]

    useEffect(() => {
        if(currPage === undefined){
            setCurrPage(activePage);
            return
        }
        anime({
            targets: `#toolbar .titleContent>div`,
            keyframes: [{
                translateY: (_el: any, i: number) => {
                    return animationVals(activePage > currPage)[i]
                },
                duration: 650
              }],
            easing: "easeOutQuart",
            complete: () => {        
                setCurrPage(activePage);
            }
        })
    }, [activePage])

    return <div className="rounded  fixed flex justify-between items-center w-full p-4 space-x-4 z-20" id="toolbar">
        <div className="text-foreground text-xl tracking-widest pl-4 flex">
            Vincent Lam / 
            <div className="revealer w-60">
                <div className="titleContent whitespace-pre w-60">
                    <div className="absolute"> {pages[currPage]}</div> 
                    <div className="absolute"> {pages[activePage]}</div> 
                </div>
            </div>
        </div>

        <div className="flex ">
            <ThemeSwitch {...{ darkMode, setDarkMode }} />
        </div>
    </div>;
}

export default Toolbar;