import { useAnimation } from "framer-motion";
import React, { useEffect } from "react";

type VertexProps = Parameters<typeof m.rect>[0] & {
  position: [number, number];
  height: number;
  width?: number;
  fill?: string;
};

const Section: React.FC<VertexProps> = (props) => {
  const {
    position,
    height,
    width = 1,
    fill = "#ffffff",
    ...otherProps
  } = props;
  const controls = useAnimation();

  useEffect(() => {
    controls.start("view");
  }, [controls]);

  return (
    <m.rect
      animate={controls}
      initial={"initial"}
      variants={{
        initial: { opacity: 0, width: 0, height: 0 },
        view: (i) => ({
          opacity: 0.2,
          width: width,
          height: height,
          transition: {
            delay: i * 0.025,
            duration: 0.33,
          },
        }),
      }}
      x={position[0]}
      y={position[1]}
      width={width}
      height={height}
      fill={fill}
      {...otherProps}
    ></m.rect>
  );
};

export default Section;
