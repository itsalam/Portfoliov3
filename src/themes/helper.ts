import { Effect } from 'postprocessing';
import { Vector2, Uniform, Color } from 'three';

export class CustomEffect extends Effect {
  u_resolution: Vector2;
  u_time: number;

  constructor(
    fragmentShader: string,
    resolution: Vector2,
    time: number,
    configs: Record<string, any>
  ) {
    const uniforms = new Map<string, Uniform>([
      ...Object.entries(configs)
        .map<[string, any]>(([name, val]) =>
          name.includes('color')
            ? [name, new Uniform(new Color(val))]
            : [name, new Uniform(val)]
        )
        .concat([
          ['time', new Uniform(time)],
          ['resolution', new Uniform(resolution)]
        ])
    ]);
    super('DomainWarpEffect', fragmentShader, {
      uniforms
    });
    this.u_resolution = resolution;
    this.u_time = time;
  }

  updateVal(key: string, value: number | Vector2) {
    const obj = this.uniforms.get(key);
    if (obj) {
      obj.value = value;
    }
  }

  update() {
    this.updateVal('time', this.u_time);
    this.updateVal('resolution', this.u_resolution);
  }
}
