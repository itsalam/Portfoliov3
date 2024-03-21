import React, { HTMLProps } from "react";

type VertexProps = HTMLProps<SVGSVGElement> & {
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
  return (
    <svg x={position[0] - size / 2} y={position[1] - size / 2} {...otherProps}>
      <rect
        y={(size - thickness) / 2}
        width={size}
        height={thickness}
        fill={fill}
      />
      <rect
        x={(size - thickness) / 2}
        width={thickness}
        height={size}
        fill={fill}
      />
    </svg>
  );
};

export default Vertex;
