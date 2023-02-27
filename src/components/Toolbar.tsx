import { Icon, InfoIcon, Switch } from "@vechaiui/react";
import { useRef, useState } from "react";

function ThemeSwitch(){
    const toggleRef = useRef(null);
    const buttonRef = useRef(null);

    const sunIcon = <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  
    const moonIcon = <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />


    const sunClasses = ['bg-theme-highlight', 'text-black']
    const moonClasses = ['bg-theme-green/.5', "hover:bg-theme-green/50", "text-theme-highlight", 'translate-x-full']
  
    let [isDarkmode, setDarkMode] = useState(false);

    function toggleTheme() {
        setTimeout(() => {
            setDarkMode(!isDarkmode);
        }, 250);
        toggleRef.current.classList.remove(...isDarkmode? moonClasses: sunClasses)
        toggleRef.current.classList.add(...isDarkmode? sunClasses: moonClasses)
    }

    return <button ref={buttonRef}
        className={`w-16 h-9 p-1 rounded-full flex items-center transition duration-150 focus:outline-none shadow ${isDarkmode? "bg-slate-600/15" : "bg-slate-300/15"}`}
        onClick={() => toggleTheme()}
        >
        <div ref={toggleRef}
            id="switch-toggle"
            className={"w-7 h-7 relative rounded-full transition duration-500 transform p-0.5 " + sunClasses.join(" ")}>
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.25} stroke="currentColor" className="w-6 h-6">
                {isDarkmode? moonIcon: sunIcon}
            </svg>
        </div>
    </button>
}

function Toolbar(){



    return <div className="rounded flex justify-between items-center w-full p-4 space-x-4">
        <div className="text-theme-highlight text-xl tracking-widest ">
            Vincent Lam
        </div>

        <div className="flex ">
            <Icon as={InfoIcon} label="info" className="w-8 h-8"/>
            <ThemeSwitch />
        </div>
    </div>; 
}

export default Toolbar;