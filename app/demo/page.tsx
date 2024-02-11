"use client";

import Effects from "@/components/Canvases/Effects";
import {
  Environment,
  OrbitControls,
  Plane,
  Point,
  Points,
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { createNoise3D, createNoise4D } from "simplex-noise";
import {
  AdditiveBlending,
  CircleGeometry,
  Group,
  ImageUtils,
  Mesh,
  PointsMaterial,
  TextureLoader,
} from "three";

// const noise3D = (...args) => Math.random();
const noise3D = createNoise3D();
const noise4D = createNoise4D();
const NUM_POINTS = 5000;
const FIELD_WIDTH = 800;
const FIELD_HEIGHT = 400;
const FIELD_DEPTH = 400;
const SPEED = 0.3;
const STEP = 1400;
const EPI = 0.05;
const MAX_TIME = 10;

function normalize(v: number[]) {
  const length = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / length, v[1] / length, v[2] / length];
}

function cross(a: [number, number, number], b: [number, number, number]) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function deltaNoise3D(x: number, y: number, z: number, t: number) {
  //Find rate of change in X plane
  let n1 = noise4D(x + EPI, y, z, t);
  let n2 = noise4D(x - EPI, y, z, t);
  //Average to find approximate derivative
  const a = (n1 - n2) / (2 * EPI);

  //Find rate of change in Y plane
  n1 = noise4D(x, y + EPI, z, t);
  n2 = noise4D(x, y - EPI, z, t);
  //Average to find approximate derivative
  const b = (n1 - n2) / (2 * EPI);

  //Find rate of change in Z plane
  n1 = noise4D(x, y, z + EPI, t);
  n2 = noise4D(x, y, z - EPI, t);
  //Average to find approximate derivative
  const c = (n1 - n2) / (2 * EPI);
  return [a, b, c];
}

const computeCurl = (x: number, y: number, z: number, t: number) => {
  const [a0, b0, c0] = normalize(deltaNoise3D(x, y, z, t));

  const [a1, b1, c1] = normalize(deltaNoise3D(x + 10.5, y + 10.5, z + 10.5, t));

  return normalize(cross([a0, b0, c0], [a1, b1, c1]));
};

const computeFlow = (x: number, y: number, z: number, t: number) => {
  const [x0, y0, z0] = [x / FIELD_WIDTH, y / FIELD_HEIGHT, z / FIELD_DEPTH];
  const x1 = noise3D(y0, z0, t);
  const y1 = noise3D(x0, z0, t);
  const z1 = noise3D(x0, y0, t);
  return [
    Math.cos(z1 * Math.PI) + Math.cos(y1 * Math.PI),
    Math.sin(z1 * Math.PI) + Math.cos(x1 * Math.PI),
    Math.sin(y1 * Math.PI) - Math.sin(x1 * Math.PI),
  ];
};

const loader = new TextureLoader();
//https://stackoverflow.com/questions/24087757/three-js-and-loading-a-cross-domain-image
ImageUtils.crossOrigin = "";
const texture = loader.load("/dust.png");

const FlowField = (props: { curl?: boolean }) => {
  const meshRef = useRef<Group>(null);
  const particlesRef = useRef<Group>(null);
  const pointRef = useRef<number[]>(new Array(NUM_POINTS).fill(0));

  const Particles3D = () => (
    <Points
      limit={5000}
      geometry={new CircleGeometry(1, 32)}
      material={
        new PointsMaterial({
          color: 0xffffff,
          size: 2,
          transparent: true,
          opacity: 0.4,
          depthTest: false,
          blending: AdditiveBlending,
          map: texture,
        })
      }
    >
      {Array.from({ length: NUM_POINTS })
        .fill(1)
        .map((data, i) => (
          <Point
            position={[
              Math.random() * FIELD_WIDTH,
              Math.random() * FIELD_HEIGHT,
              Math.random() * FIELD_DEPTH,
            ]}
            key={i}
          />
        ))}
    </Points>
  );

  useFrame((state) => {
    const particles = particlesRef.current;

    if (particles) {
      const children = particles.children[0].children as Mesh[];

      children.forEach((node, i) => {
        const position = node.position;
        const [x, y, z] = [position.x, position.y, position.z];
        const [cx, cy, cz] = computeCurl(
          x / STEP,
          y / STEP,
          z / STEP,
          state.clock.getElapsedTime() * 0.001
        );
        const [fx, fy, fz] = computeFlow(
          x,
          y,
          z,
          state.clock.getElapsedTime() * 0.001
        );
        if (
          pointRef.current[i] > MAX_TIME ||
          node.position.x < 0 ||
          node.position.x > FIELD_WIDTH ||
          node.position.y < 0 ||
          node.position.y > FIELD_HEIGHT ||
          node.position.z < 0 ||
          node.position.z > FIELD_DEPTH
        ) {
          node.position.x = Math.random() * FIELD_WIDTH;
          node.position.y = Math.random() * FIELD_HEIGHT;
          node.position.z = Math.random() * FIELD_DEPTH;
          pointRef.current[i] += state.clock.getDelta();
        } else {
          node.position.x += (cx * SPEED) / 4 + fx * SPEED;
          node.position.y += (cy * SPEED) / 4 + fy * SPEED;
          node.position.z += (cz * SPEED) / 4 + fz * SPEED;
          pointRef.current[i] = 0;
        }

        node.updateMatrix();
      });
    }
  });

  return (
    <>
      <group position={[0, 0, 0]} ref={meshRef}>
        {/* <FlowField3D /> */}
      </group>
      <group position={[0, 0, 0]} ref={particlesRef}>
        <Particles3D />
      </group>
    </>
  );
};

const App = () => {
  return (
    <Canvas camera={{ position: [0, 0, FIELD_DEPTH] }}>
      <Environment preset="city" />
      <ambientLight />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <group position={[-FIELD_WIDTH / 2, -FIELD_HEIGHT / 2, 0]}>
        <FlowField curl />
        <group position={[FIELD_WIDTH / 2, FIELD_HEIGHT / 2, 0]}>
          <Plane args={[100, 100]}>
            <meshStandardMaterial transparent opacity={0.5} color="red" />
          </Plane>
        </group>
      </group>
      <OrbitControls />
      <Effects />
    </Canvas>
  );
};

export default App;
