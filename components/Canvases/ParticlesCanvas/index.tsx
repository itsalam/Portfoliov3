"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { GUI } from "dat.gui";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  DoubleSide,
  FloatType,
  HalfFloatType,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Scene,
  Vector2,
  WebGLRenderTarget,
} from "three";
import ShaderPlane from "./ParticlePlane";
import Advection from "./stages/Advection";
import Divergence from "./stages/Divergence";
import ExternalForce from "./stages/ExternalForce";
import Poisson from "./stages/Poisson";
import Pressure from "./stages/Pressure";
import Viscous from "./stages/Viscous";

type FBOs = {
  vel_0: WebGLRenderTarget;
  vel_1: WebGLRenderTarget;
  vel_viscous0: WebGLRenderTarget;
  vel_viscous1: WebGLRenderTarget;
  div: WebGLRenderTarget;
  pressure_0: WebGLRenderTarget;
  pressure_1: WebGLRenderTarget;
} & Record<string, WebGLRenderTarget>;

const ParticleScene = () => {
  const { gl, size } = useThree();

  // SHADER CONFIGURATION
  const options = useRef({
    dt: 0.014,
    cursorSize: 0.1,
    mouseForce: 20,
    resolution: 0.5,
    viscous: 30,
    iterations: 32,
    isViscous: true,
  });
  const type = /(iPad|iPhone|iPod)/g.test(navigator.userAgent)
    ? HalfFloatType
    : FloatType;
  const width = useRef(Math.round(size.width * options.current.resolution));
  const height = useRef(Math.round(size.height * options.current.resolution));
  const cellScale = useRef(new Vector2(1 / width.current, 1 / height.current));
  const fboSize = useRef(new Vector2(width.current, height.current));
  const sceneRef = useRef<Scene>();

  const fbos = useRef<FBOs>({
    vel_0: new WebGLRenderTarget(fboSize.current.x, fboSize.current.y, {
      type,
    }),
    vel_1: new WebGLRenderTarget(fboSize.current.x, fboSize.current.y, {
      type,
    }),
    vel_2: new WebGLRenderTarget(fboSize.current.x, fboSize.current.y, {
      type,
    }),
    vel_viscous0: new WebGLRenderTarget(fboSize.current.x, fboSize.current.y, {
      type,
    }),
    vel_viscous1: new WebGLRenderTarget(fboSize.current.x, fboSize.current.y, {
      type,
    }),
    div: new WebGLRenderTarget(fboSize.current.x, fboSize.current.y, { type }),
    pressure_0: new WebGLRenderTarget(fboSize.current.x, fboSize.current.y, {
      type,
    }),
    pressure_1: new WebGLRenderTarget(fboSize.current.x, fboSize.current.y, {
      type,
    }),
  });

  const createAllFBO = useCallback(() => {
    const allKeys = Object.keys(fbos.current);

    allKeys.forEach((key) => {
      fbos.current[key].setSize(fboSize.current.x, fboSize.current.y);
      fbos.current[key].texture.updateMatrix();
    });
  }, [fbos]);

  const boundarySpace = useMemo(() => cellScale.current, []);

  const defaultProps = {
    gl,
    boundarySpace,
    cellScale: cellScale.current,
    fboSize: fboSize.current,
  };

  const advection = new Advection({
    ...defaultProps,
    dst: fbos.current.vel_1,
    dt: options.current.dt,
    src: fbos.current.vel_0,
  });

  const externalForce = new ExternalForce({
    ...defaultProps,
    dst: fbos.current.vel_1,
    cursorSize: options.current.cursorSize,
  });

  const viscous = new Viscous({
    ...defaultProps,
    velocity: fbos.current.vel_1,
    v: options.current.viscous,
    dt: options.current.dt,
    dst: fbos.current.vel_viscous1,
    dst1: fbos.current.vel_viscous0,
  });

  const divergence = new Divergence({
    ...defaultProps,
    dt: options.current.dt,
    velocity: fbos.current.vel_viscous0,
    dst: fbos.current.div,
  });

  const poisson = new Poisson({
    ...defaultProps,
    divergence: fbos.current.div,
    dst: fbos.current.pressure_1,
    dst1: fbos.current.pressure_0,
  });

  const pressurePass = new Pressure({
    ...defaultProps,
    dt: options.current.dt,
    velocity: fbos.current.vel_viscous0,
    pressure: fbos.current.pressure_0,
    dst: fbos.current.vel_0,
  });

  useFrame(({ pointer, clock }) => {
    advection.update({ dt: options.current.dt });
    externalForce.update({
      pointer,
      cursorSize: options.current.cursorSize,
      mouseForce: options.current.mouseForce,
      cellScale: cellScale.current,
      time: clock.getElapsedTime(),
    });

    const velocity = options.current.isViscous
      ? viscous.update({
        viscous: options.current.viscous,
        iterations: options.current.iterations,
        dt: options.current.dt,
      })
      : fbos.current.vel_1;
    divergence.update({ velocity });
    const pressure = poisson.update({
      iterations: options.current.iterations,
    });
    pressurePass.update({ velocity, pressure });
  });

  useEffect(() => {
    const gui = new GUI();
    gui.add(options.current, "dt", 1 / 200, 1 / 30);
    gui.add(options.current, "cursorSize", 0.01, 1);
    gui.add(options.current, "mouseForce", 10, 200);
    gui.add(options.current, "viscous", 0, 500);
    gui.add(options.current, "iterations", 1, 128);

    return () => {
      gui.destroy();
    };
  }, []);

  useEffect(() => {
    gl.autoClear = false;
    gl.setClearColor(0x000000);
    gl.setPixelRatio(window.devicePixelRatio);
  }, [gl]);

  useEffect(() => {
    const recalcSize = () => {
      width.current = Math.round(size.width * options.current.resolution);
      height.current = Math.round(size.height * options.current.resolution);
      fboSize.current.set(width.current, height.current);
      cellScale.current.set(1 / width.current, 1 / height.current);
      createAllFBO();
    };
    document.body.addEventListener("resize", recalcSize, false);
    return () => {
      document.body.removeEventListener("resize", recalcSize);
    };
  }, [createAllFBO, size, size.height, size.width]);

  return (
    <scene ref={sceneRef}>
      <ShaderPlane
        velocityTexture={fbos.current.vel_0}
        cellScale={cellScale.current}
      />

      {/* <group position={[-10, 0, -1]}>
        <DebugView renderTarget={fbos.current.vel_0} />
      </group>
      <group position={[-5, 0, -1]}>
        <DebugView renderTarget={fbos.current.vel_1} />
      </group>
      <group position={[0, 0, -1]}>
        <DebugView renderTarget={fbos.current.vel_viscous0} />
      </group>
      <group position={[5, 0, -1]}>
        <DebugView renderTarget={fbos.current.vel_viscous1} />
      </group>
      <group position={[10, 0, -1]}>
        <DebugView renderTarget={fbos.current.div} />
      </group>
      <group position={[0, 5, -1]}>
        <DebugView renderTarget={fbos.current.pressure_0} />
      </group>
      <group position={[0, -5, -1]}>
        <DebugView renderTarget={fbos.current.pressure_1} />
      </group> */}
    </scene>
  );
};

const DebugView = ({ renderTarget }: { renderTarget: WebGLRenderTarget }) => {
  const material = new MeshBasicMaterial({
    map: renderTarget.texture,
    side: DoubleSide,
  });

  const geometry = new PlaneGeometry(4, 2); // Full viewport quad

  return <primitive object={new Mesh(geometry, material)} />;
};

const ParticleCanvas = () => {
  return (
    <Canvas
      id="particle-canvas"
      gl={{ antialias: true, alpha: true, autoClear: false }}
    >
      <ParticleScene />
      <OrbitControls />
    </Canvas>
  );
};

export default ParticleCanvas;
