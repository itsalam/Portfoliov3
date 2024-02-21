import { Vector2 } from "three";
import { BasePassProps } from "./BasePass";
import ExternalForce from "./ExternalForce";

type ExternalForceProps = {
  cellScale: Vector2;
  cursorSize: number;
} & Omit<BasePassProps, "material">;

export default class Forces {
  externalForce: ExternalForce;

  constructor(props: ExternalForceProps) {
    const { cellScale, cursorSize, ...baseProps } = props;
  }
}
