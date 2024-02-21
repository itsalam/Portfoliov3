"use client";

import Effects from "@/components/Canvases/Effects";
import { Environment, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  CylinderCollider,
  InstancedRigidBodies,
  InstancedRigidBodyProps,
  Physics,
  RapierRigidBody,
  RigidBody,
} from "@react-three/rapier";
import { Suspense, useMemo, useRef } from "react";
import { createNoise3D, createNoise4D } from "simplex-noise";
import {
  AdditiveBlending,
  CircleGeometry,
  Frustum,
  Group,
  Matrix4,
  PointsMaterial,
  PointsMaterialParameters,
  Quaternion,
  TextureLoader,
  Vector3,
} from "three";

// const noise3D = (...args) => Math.random();
const noise3D = createNoise3D();
const noise4D = createNoise4D();
const FIELD_WIDTH = 1000;
const FIELD_HEIGHT = 600;
const FIELD_DEPTH = 400;
const SPEED = 20;
const STEP = 2400.0;
const FLUID_STEP = 7;
const EPI = 0.05;

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
  const [x0, y0, z0] = [
    (x / FIELD_WIDTH) * FLUID_STEP,
    (y / FIELD_HEIGHT) * FLUID_STEP,
    (z / FIELD_DEPTH) * FLUID_STEP,
  ];
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
const texture = loader.load("/dust5.png");

type UserData = {
  time?: number;
  velocity?: Vector3;
};

const Particles3D = (props: {
  amount: number;
  pointProps?: InstancedRigidBodyProps;
  materialProps?: PointsMaterialParameters;
  pKey?: string;
}) => {
  const { amount, pointProps, materialProps, pKey, ...other } = props;
  const rigidBodies = useRef<RapierRigidBody[]>(null);
  const randomStartPosition = () =>
    new Vector3(
      FIELD_WIDTH * (Math.random() * 0.3 - 0.5),
      (Math.random() - 0.5) * FIELD_HEIGHT,
      (Math.random() - 0.5) * FIELD_DEPTH
    );

  const instances = useMemo(
    () =>
      Array.from({ length: amount })
        .fill(1)
        .map((data, i) => ({
          position: randomStartPosition(),
          density: 50,
          key: `${pKey}-${i}`,
          ...pointProps,
        })),
    [amount, pKey, pointProps]
  );

  const movePoint = (point: RapierRigidBody, t: number) => {
    const position = point.translation();
    const [x, y, z] = [position.x, position.y, position.z];
    const [cx, cy, cz] = computeCurl(x / STEP, y / STEP, z / STEP, t);
    const [fx, fy, fz] = computeFlow(x, y, z, t);
    const acceleration: Vector3 = new Vector3(0, 0, 0);
    const curlSpeed = (1.6 + noise3D(cx, cy, t)) * SPEED * 2;
    const flowSpeed = ((2 + noise3D(fx, fy, t)) * SPEED) / 2;
    acceleration.x = (cx * curlSpeed + flowSpeed * fx) * 1.25;
    acceleration.y = (cy * curlSpeed + flowSpeed * fy) * -(y / FIELD_HEIGHT);
    acceleration.z = (cz * curlSpeed + flowSpeed * fz) * -(z / FIELD_DEPTH);
    // point.applyImpulse(acceleration.multiplyScalar(1), true);
    point.setLinvel(
      new Vector3().addVectors(
        acceleration
          .addScaledVector(
            new Vector3(
              // Math.max(0, (((-x + 0.5) / FIELD_WIDTH) * SPEED) / 15),
              0,
              0,
              0
            ),
            1
          )
          .multiplyScalar(0.7),
        point.linvel()
      ),
      true
    );
    // point.applyImpulse(
    //   new Vector3(Math.max(0, (-x / FIELD_WIDTH) * 10), 0, 0),
    //   true
    // );
  };

  useFrame((state) => {
    const camera = state.camera;
    const bodies = rigidBodies.current;
    const t = state.clock.getElapsedTime() * 0.005;
    const frustum = new Frustum();

    // Step 2: Update the Frustum
    // Combine the camera's projection matrix and its view matrix
    const projScreenMatrix = new Matrix4();
    projScreenMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(projScreenMatrix);
    if (bodies) {
      // console.log(children);
      bodies.forEach((node) => {
        const position = node.translation() as Vector3;
        const time = (node.userData as UserData)?.time;
        if (!frustum.containsPoint(position)) {
          node.setTranslation(randomStartPosition(), true);
          node.userData = { time: 0 };
        } else {
          movePoint(node, t);
          node.userData = { time: (time ?? 0) + state.clock.getDelta() };
        }
      });
    }
  });

  return (
    <InstancedRigidBodies
      // colliderNodes={[<BallCollider key={0} args={[1]} />]}
      ref={rigidBodies}
      {...other}
      instances={instances}
      enabledRotations={[false, false, false]}
      linearDamping={20}
    >
      <instancedMesh
        args={[
          new CircleGeometry(materialProps?.size ?? 1, 12),
          new PointsMaterial({
            transparent: true,
            opacity: materialProps?.opacity ?? 0.5,
            depthTest: false,
            blending: AdditiveBlending,
            map: texture,
            side: 2,
            ...materialProps,
          }),
          amount,
        ]}
      />
    </InstancedRigidBodies>
  );
};

function Pointer({ vec = new Vector3() }) {
  const ref = useRef<RapierRigidBody>(null);
  useFrame(({ pointer, viewport, camera }) => {
    ref.current?.setNextKinematicTranslation(
      vec.set(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
        0
      )
    );
    const directionToCamera = new Vector3()
      .subVectors(camera.position, vec)
      .normalize();
    const quat = new Quaternion().setFromUnitVectors(
      new Vector3(0, 1, 0),
      directionToCamera
    );
    ref.current?.setRotation(quat, true);
  });
  return (
    <RigidBody
      position={[0, 0, 0]}
      type="kinematicPosition"
      colliders={false}
      ref={ref}
      rotation={[Math.PI / 2, 0, 0]}
      density={0.01}
    >
      <CylinderCollider args={[FIELD_DEPTH * 2, 50]} />
    </RigidBody>
  );
}

const FlowField = (props: { curl?: boolean }) => {
  const meshRef = useRef<Group>(null);

  useFrame((state) => {});

  return (
    <Suspense>
      <Physics gravity={[500, -10, 0]}>
        <group ref={meshRef}>
          {/* <Pointer /> */}
          <Particles3D
            pKey="particles3"
            amount={400}
            materialProps={{ opacity: 0.075, size: 16, color: 0x6e6e6e }}
          />
          <Particles3D
            pKey="particles4"
            amount={500}
            materialProps={{ opacity: 0.15, size: 7, color: 0x6e6e6e }}
          />
          <Particles3D
            pKey="particles5"
            amount={150}
            materialProps={{ opacity: 0.2, size: 1, color: 0x6e6e6e }}
          />
          <Particles3D
            pKey="particles6"
            amount={50}
            materialProps={{
              opacity: 0.9,
              size: 1,
              color: 0xb4b4b4,
              map: null,
              sizeAttenuation: true,
            }}
          />
        </group>
      </Physics>
    </Suspense>
  );
};

const App = () => {
  return (
    <div className="absolute w-full h-full z-100 left-0 bottom-0">
      <Canvas
        flat
        style={{ display: "absolute" }}
        camera={{ position: [0, 0, FIELD_DEPTH * 1.25], far: 3000 }}
      >
        <Environment preset="city" />
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <group>
          <FlowField />
        </group>
        <OrbitControls />
        <Effects />
      </Canvas>
    </div>
  );
};

export default App;
