import React from "react";
import { useMemo, useRef } from "react";
import fragmentShader from "./assets/shaders/fragment.glsl";
import vertexShader from "./assets/shaders/vertex.glsl";
import { Vector2, Vector3 } from "three";

export default function Background() {
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => {
    return {
      points: { value: [] },
      mouse: { value: new Vector2(0, 0) },
      scaling: { value: new Vector3(0.6, 0.6, 0.6)},
    };
  }, []);

  const customShader = (
    <shaderMaterial
      ref={shaderRef}
      attach="material"
      args={[
        {
          uniforms,
          fragmentShader,
          vertexShader,
        },
      ]}
    />
  );

  return (
    <mesh>
      <planeGeometry args={[1.5, 1.5]}/>
      {customShader}
    </mesh>
  );
}
