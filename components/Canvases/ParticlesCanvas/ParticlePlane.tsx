"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  PlaneGeometry,
  Points,
  ShaderMaterial,
  Vector2,
  WebGLRenderTarget,
} from "three";
const WIDTH = 200;

const ShaderPlane = ({
  velocityTexture,
  cellScale,
}: {
  velocityTexture: WebGLRenderTarget;
  cellScale: Vector2;
}) => {
  const { gl, scene } = useThree();
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          px: { value: cellScale },
          boundarySpace: { value: new Vector2(0, 0) },
          uFlowField: { value: velocityTexture },
          uTime: { value: 0 },
        },
        vertexShader: `
          precision highp float;
          uniform sampler2D uFlowField;
          uniform float uTime;
          uniform vec2 px;
          uniform vec2 boundarySpace;
          varying vec2 vUv;

          void main(){
              // vec3 pos = position;
              // vec2 scale = 1.0 - boundarySpace * 2.0;
              // pos.xy = pos.xy * scale;
              // vUv = vec2(0.5)+(pos.xy)*0.5;
              // gl_Position = vec4(pos, 1.0);
              vec2 scale = 1.0 - boundarySpace * 2.0;
              vec2 flow = texture2D(uFlowField, uv).xy;
              vec2 newPosition = position.xy + flow;
              vec4 mvPosition = modelViewMatrix * vec4( newPosition, length(flow)/2.0, 1.0 );
              mvPosition.xy = mvPosition.xy * scale;
              vUv = uv;
              gl_PointSize = 2.5;
              gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
        uniform sampler2D uFlowField;
        varying vec2 vUv;
          void main() {
            vec2 flow = texture2D(uFlowField, vUv).xy;
            gl_FragColor = vec4(vUv, 1.0, 1.0); // Particle appearance
          }
        `,
      }),
    [velocityTexture, cellScale]
  );

  // const gpuPoints = useMemo(() => new GPUPoints(WIDTH), []);
  // scene.add(gpuPoints);
  // const gpu = useMemo(() => {
  //   return new GPGPU(WIDTH, WIDTH, gl, velocityTexture.texture);
  // }, [gl, velocityTexture.texture]);

  const pointsRef = useRef<Points>(null);

  useFrame(({ clock }) => {
    const points = pointsRef.current;
    if (points && points.material) {
      points.material.uniforms.uFlowField.value = velocityTexture.texture;
    }

    // gpu.setVelocityTexture(velocityTexture.texture);
    // gpu.positionVariable.material.uniforms.delta.value = clock.getDelta();
    // gpu.compute();
    // if (gpuPoints && gpuPoints.material.uniforms) {
    //   gpuPoints.material.uniforms.posTexture.value = gpu.getCurrentRenderTarget(
    //     gpu.positionVariable
    //   ).texture;
    // }
  });

  return (
    <>
      {/* <mesh ref={planeRef} geometry={new PlaneGeometry(0.2, 0.2)}>
        <primitive attach="material" object={material} />
      </mesh> */}
      <points
        ref={pointsRef}
        args={[new PlaneGeometry(20, 20, 100, 100), material]}
      >
        {/* <Point position={new Vector3(0, 0, 0)} size={50} />
        {geometry.map((pos, i) => (
          <Point key={i} position={pos} size={50} />
        ))} */}
      </points>
    </>
  );
};

export default ShaderPlane;
