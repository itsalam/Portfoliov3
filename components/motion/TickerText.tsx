import { cn } from "@/lib/utils";
import { m, useAnimate, useSpring } from "framer-motion";
import { ComponentProps, Fragment, useEffect } from "react";

type TickerTextProps = ComponentProps<typeof m.div> & {
  // elements: ReactNode[];
  children: React.ReactNode;
};

export const TickerText = ({
  children,
  className,
  ...props
}: TickerTextProps) => {
  const [scope, animate] = useAnimate();
  const x = useSpring(0);

  useEffect(() => {
    animate(
      scope.current,
      {
        x: ["0%", `-${100 / 3}%`],
      }, // Move from 0% to -100% of the container width
      {
        duration: 20, // Adjust to control speed
        ease: "linear",
        repeat: Infinity,
      }
    );
  }, [animate, scope]);

  const handleMouseMove = (event: React.MouseEvent) => {
    // Calculate new x position based on mouse position within the container
    const rect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - rect.left; // mouse X position relative to container

    x.set(-mouseX * 0.2); // Set ticker position to follow the mouse
  };

  return (
    <m.div
      className={cn(
        "relative w-full",
        className
      )}
      onMouseMove={handleMouseMove}
      onHoverStart={() => {
        scope.animations[0]?.pause();
      }}
      onHoverEnd={() => {
        setTimeout(() => scope.animations[0]?.play(), 500);
      }}
      {...props}
    >
      <m.div style={{ x }}>
        <m.div
          className="relative flex w-min"
          ref={scope}
        >
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Fragment key={i}>{children}</Fragment>
            ))}
        </m.div>
      </m.div>
    </m.div>
  );
};
