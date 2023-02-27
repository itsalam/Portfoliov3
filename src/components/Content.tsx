import Menu from "./Menu";

function Content(){

    return <div className="flex justify-center items-center w-full h-max px-10 z-10 grow">
        
        <div className="flex gap-6 w-10/12 h-2/3">
            <Menu/>
            <div className="flex bg-slate-200/20 w-full h-full mr-48">
                look at this bullshit here
            </div>
        </div>
    </div>; 
}

export default Content;