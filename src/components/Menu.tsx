import cn from "classnames";
import anime from "animejs";
import {debounce} from "lodash";
import { ReactNode, useRef, useState, useLayoutEffect, useEffect } from "react";

function Menu({vertical= true}){
    const START = vertical? "top" : "left";
    const END = vertical? "bottom" : "right";
    const SIZE = vertical? "height" : "width";

    const menuItems = ["Home", "Projects", "Work", "Contact"];
    const menuRef = useRef<HTMLDivElement>(null);
    const menuItemRef = menuItems.map(() => useRef<HTMLButtonElement>(null));
    const selectorRef = useRef<HTMLDivElement>(null);

    let selected = 0;
    const Selector = ({}) => {
         return <div 
        id="selector"
        ref={selectorRef}
        className={
        `absolute border-2 mt-[3px] mx-0.5 border-theme-highlight rounded-full w-2.5 h-2.5 opacity-100 translate-y-3 `}
        />
    }

    const getMenuCoord = (index:number) => {
        const menuCoords = menuItemRef[index]?.current?.getBoundingClientRect();
        const selectorCoords = selectorRef.current?.getBoundingClientRect();
        const offset = menuRef.current?.getBoundingClientRect()[START] ?? 0;
        return (
          (menuCoords[START] + menuCoords[END]) / 2 -
          selectorCoords[SIZE] / 2 -
          offset
        );
      };

    const moveSelector = debounce((i:number, selected?: number) => {
        console.log(i)
        const moveVal = getMenuCoord(i);
        anime({
          targets: "#selector",
          [START]: moveVal,
          duration: 500,
          easing: "easeOutQuart",
        });
      }, 150, {trailing:true});  

    const updateSelector = debounce((i) =>  
        (selectorRef.current!.style[START] = `${getMenuCoord(i)}px`), 300);  

    useEffect(() => {
        updateSelector(selected);
        window.addEventListener("resize", updateSelector);
        return () => window.removeEventListener("resize", updateSelector);
    }, []);
    
    const Divider = () => <div className={"w-[2px] h-4 bg-theme-highlight m-auto my-2.5"} />

    const onClick = (i) => {
        selected=i;
    }

    const MenuButton = (props:{index:number, isTop:boolean, isBottom: boolean, text: string}) => {
        const {index, isTop, isBottom, text} = props;
        
        return <button 
        ref={menuItemRef[index]}
        onMouseDown={(e) => onClick(index)} 
        onMouseEnter={() => moveSelector(index)}
        className={cn(
            `flex group items-center duration-300 justify-center transition w-full px-0.5 py-4 hover:bg-theme-mute/10`, 
            {
                "rounded-t-[1em]": isTop,
                "rounded-b-[1em]": isBottom
            })
        }
        >
            <p className={cn(
            `transition duration-300 tracking-wide -translate-y-1`)
        }>
            {text.toUpperCase()}</p>
        </button>
    }

    const MenuContent = () => <>
        {menuItems.map<ReactNode>((item, i) => {
            return <MenuButton key={`${i}`} index={i} isTop={i == 0} isBottom={i == menuItems.length-1} text={item}/>
        }).reduce((prev, curr, i) => [prev, <Divider key={`divider-i`}/>, curr])}
    </>

    return <div ref={menuRef} 
        onMouseLeave ={() => moveSelector(selected)}
        className="flex relative bg-theme-mute/5 rounded-[1em] flex-col items-center w-48 text-theme-highlight font-normal text-lg mt-24 mb-auto">
        <Selector/>
        <MenuContent/>
    </div>; 
}



export default Menu;



