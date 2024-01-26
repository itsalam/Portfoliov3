import { motion, useAnimation } from "framer-motion";
import React, { useEffect } from "react";

type VertexProps = Parameters<typeof motion.svg>[0] & {
  position: [number, number];
  size: number;
  thickness?: number;
  fill?: string;
};

const Vertex: React.FC<VertexProps> = (props) => {
  const {
    position,
    size,
    thickness = 1,
    fill = "#ffffff",
    ...otherProps
  } = props;
  const controls = useAnimation();

  useEffect(() => {
    controls.start("view");
  }, [controls]);

  return (
    <motion.svg
      animate={controls}
      initial={"initial"}
      variants={{
        initial: { opacity: 0 },
        view: (i) => ({
          opacity: 1,
          transition: {
            delay: i * 0.025,
            duration: 0.33,
          },
        }),
      }}
      x={position[0] - size / 2}
      y={position[1] - size / 2}
      {...otherProps}
    >
      <motion.rect
        y={(size - thickness) / 2}
        width={size}
        height={thickness}
        fill={fill}
      />
      <motion.rect
        x={(size - thickness) / 2}
        width={thickness}
        height={size}
        fill={fill}
      />
    </motion.svg>
  );
};

export default Vertex;
