import { m, useAnimation } from "framer-motion";
import React, { useEffect } from "react";

type LineProps = Parameters<typeof m.line>[0] & {
  orientation: "horizontal" | "vertical";
  length: number;
  thickness?: number;
  fill?: string;
};

const Line: React.FC<LineProps> = (props) => {
  const {
    orientation,
    length,
    fill = "#ffffff",
    thickness = 0.5,
    ...otherProps
  } = props;
  const animationDimension = orientation === "horizontal" ? "x2" : "y2";
  const controls = useAnimation();

  useEffect(() => {
    controls.start("view");
  }, [controls]);

  return (
    <m.line
      initial={"initial"}
      animate={controls}
      variants={{
        initial: { opacity: 1, [animationDimension]: 0 },
        view: (i) => ({
          opacity: 1,
          [animationDimension]: length,
          transition: {
            duration: 0.3,
            delay: i * 0.025,
          },
        }),
      }}
      stroke={fill}
      strokeWidth={thickness}
      {...otherProps}
    />
  );
};

export default Line;
