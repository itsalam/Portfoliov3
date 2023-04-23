import { HTMLProps, useEffect, useMemo, useRef, useState } from "react";

const TOP_OFFSET = 0.1;

export default function Carousel(props: { visible: boolean } & HTMLProps<HTMLDivElement>) {
    const { visible: visProp, ...otherProps } = props;
    const [visible, setVisible] = useState<boolean>(visProp);
    const [mousePosY, setMousePosY] = useState<number>(0);
    const [percentage, setPercentage] = useState<number>(0);
    const [prevPercentage, setPrevPercentage] = useState<number>(0);

    const carouselRef = useRef<HTMLDivElement>(null);

    const topOffset = TOP_OFFSET * window.innerHeight;

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

    const autoScroll = () => {
        setTimeout(() => {
            if (!mousePosY && carouselRef.current) {
                const totalDist = carouselRef.current.getBoundingClientRect().height - window.innerHeight + topOffset * 2;

                (carouselRef.current as HTMLDivElement).animate(
                    { top: [`${(-totalDist * prevPercentage) + topOffset}px`, `${(-totalDist) + topOffset}px`] },
                    { duration: 40000 * (1 - prevPercentage), fill: "forwards" });
            }
        }, 1000)
    }

    const stopAutoScroll = () => {
        if (!mousePosY && carouselRef.current) {
            carouselRef.current.getAnimations().forEach(ani => ani.pause());
            const computedStyle = window.getComputedStyle(carouselRef.current);
            const currTop = computedStyle.getPropertyValue('top');
            const totalDist = carouselRef.current.getBoundingClientRect().height - window.innerHeight + topOffset * 2;
            if (currTop) {
                const currProgress = Math.max(Math.min((-parseFloat(currTop) + topOffset) / totalDist, 1), 0);
                setPrevPercentage(currProgress);
            }
        }
    }


    useEffect(() => {
        if (visProp) {
            console.log("visible");
            setVisible(true);
            (carouselRef.current as HTMLDivElement).animate(
                { opacity: [0, 1] },
                { duration: 700, fill: "forwards", delay: 2000 });
            autoScroll();
        } else {
            const fadeOut = (carouselRef.current as HTMLDivElement).animate(
                { opacity: [1, 0] },
                { duration: 700, fill: "forwards" });
            fadeOut.finished.then(() => {
                setVisible(false)
            })
        }
    }, [carouselRef, visProp])

    const handleMouseUp = () => {
        setMousePosY(0);
        setPrevPercentage(percentage);
    }

    return <div
        className={`carousel fixed top-0 h-screen w-80 -translate-x-1/2 ${visProp || visible ? "" : "hidden"}`}
        onMouseDown={(e) => setMousePosY(e.clientY)}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={autoScroll}
        onMouseEnter={stopAutoScroll}
        draggable={false}
        {...otherProps}
    >
        <div
            className="carousel-track absolute flex h-auto w-80 flex-col gap-4 opacity-0 transition-all"
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