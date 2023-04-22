import { HTMLProps, useRef, useState } from "react";

const TOP_OFFSET = 0.1;

export default function Carousel(props: { visible: boolean } & HTMLProps<HTMLDivElement>) {
    const [mousePosY, setMousePosY] = useState<number>(0);
    const [percentage, setPercentage] = useState<number>(0);
    const [prevPercentage, setPrevPercentage] = useState<number>(0);

    const topOffset = TOP_OFFSET * window.innerHeight;

    const carouselRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (mousePosY && carouselRef.current) {
            const mouseDelta = mousePosY - e.clientY;
            const totalDist = carouselRef.current.getBoundingClientRect().height - window.innerHeight + topOffset * 2;
            const nextPercentage = Math.max(Math.min(prevPercentage + (mouseDelta / totalDist), 1), 0);
            setPercentage(nextPercentage);
            (carouselRef.current as HTMLDivElement).animate(
                { top: `${(-nextPercentage * totalDist) + topOffset}px` },
                { duration: 1200, fill: "forwards" });

        }
    }

    const handleMouseUp = () => {
        setMousePosY(0);
        setPrevPercentage(percentage);
    }

    return !props.visible ? <></> : <div
        className="carousel fixed top-0 h-screen w-80 -translate-x-1/2 opacity-0"
        onMouseDown={(e) => setMousePosY(e.clientY)}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        draggable={false}
        {...props}
    >
        <div
            className="carousel-track absolute flex h-auto w-80 flex-col gap-4 transition-all"
            style={{ top: `${topOffset}px` }}
            ref={carouselRef}
        >
            {[...Array(4).keys()].map((i) => {
                return (
                    <img
                        key={i}
                        draggable={false}
                        src={`https://source.unsplash.com/featured/1200x800sig=${i}`}
                        className={
                            'h-[30rem] w-80 flex-1 rounded-md object-cover object-center'
                        }

                    />
                );
            })}
        </div>

    </div>
}