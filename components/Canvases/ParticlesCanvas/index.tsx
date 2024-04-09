"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
// import { GUI } from "dat.gui";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  DataTexture,
  DoubleSide,
  FloatType,
  HalfFloatType,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  NearestFilter,
  PerspectiveCamera,
  PlaneGeometry,
  RGBAFormat,
  RepeatWrapping,
  Scene,
  Texture,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderTarget,
  WebGLRenderer,
} from "three";
import "./PointsMaterial";
import DofPointsMaterial from "./PointsMaterial";
import Advection from "./stages/Advection";
import Divergence from "./stages/Divergence";
import ExternalForce from "./stages/ExternalForce";
import Poisson from "./stages/Poisson";
import Position from "./stages/Position";
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

function getPoint(
  v: Vector4,
  size: number,
  data: Float32Array,
  offset: number
) {
  v.set(
    Math.random() * 1.8 - 0.95,
    Math.random() * 1.8 - 0.95,
    Math.random() * 1.8 - 0.95,
    0
  );
  // if (v.length() > 1) return getPoint(v, size, data, offset);
  return v.toArray(data, offset);
}

function getSphere(count: number, size: number, p = new Vector4()) {
  const data = new Float32Array(count * 4);
  for (let i = 0; i < count * 4; i += 4) getPoint(p, size, data, i);
  return data;
}

const ParticleScene = () => {
  const coords = useRef({ x: 0, y: 0 });
  const particleLength = 75;
  const { gl, size, camera } = useThree();
  const renderRef = useRef<DofPointsMaterial>(null!);
  const sceneRef = useRef<Scene>(null);
  const { resolvedTheme } = useTheme();
  const particles = useMemo(() => {
    const length = particleLength * particleLength;
    const particles = new Float32Array(length * 3);
    for (let i = 0; i < length; i++) {
      const i3 = i * 3;
      particles[i3 + 0] = (i % particleLength) / particleLength;
      particles[i3 + 1] = ~~(i / particleLength) / particleLength;
    }
    return particles;
  }, [particleLength]);

  // SHADER CONFIGURATION
  const options = useRef({
    dt: 0.001,
    cursorSize: 0.03,
    mouseForce: 50,
    resolution: 0.75,
    viscous: 200,
    iterations: 3,
    isViscous: true,
    aperture: 40.0,
    fov: 3.5,
    focus: 4.2,
    color:
      resolvedTheme === "light"
        ? new Vector3(0.215, 0.231, 0.223)
        : new Vector3(0.69, 0.709, 0.682),
  });
  const type = /(iPad|iPhone|iPod)/g.test(navigator.userAgent)
    ? HalfFloatType
    : FloatType;
  const width = useRef(Math.round(size.width * options.current.resolution));
  const height = useRef(Math.round(size.height * options.current.resolution));
  const cellScale = useRef(new Vector2(1 / width.current, 1 / height.current));
  const fboSize = useRef(new Vector2(width.current, height.current));

  const fluidFbos = useRef<FBOs>({
    vel_0: createRenderTarget(),
    vel_1: createRenderTarget(),
    vel_viscous0: createRenderTarget(),
    vel_viscous1: createRenderTarget(),
    div: createRenderTarget(),
    pressure_0: createRenderTarget(),
    pressure_1: createRenderTarget(),
  });

  const particleFbos = useRef<Record<string, WebGLRenderTarget>>({
    position_0: createRenderTarget({ size: particleLength, gl }),
    position_1: createRenderTarget({ size: particleLength, gl }),
  });

  // useEffect(() => {
  //   const optionsCur = options.current;
  //   const gui = new GUI();
  //   gui.add(optionsCur, "dt", 0, 0.3);
  //   gui.add(optionsCur, "cursorSize", 0, 0.3);
  //   gui.add(optionsCur, "focus", 0, 40);
  //   gui.add(optionsCur, "aperture", 0, 40);
  //   gui.add(optionsCur, "fov", 0, 0);
  //   return () => {
  //     gui.destroy();
  //   };
  // });

  function createRenderTarget(options?: { size: number; gl: WebGLRenderer }) {
    const { size, gl } = options ?? {};
    const target = new WebGLRenderTarget(
      size ?? fboSize.current.x,
      size ?? fboSize.current.y,
      {
        type,
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        wrapS: RepeatWrapping,
        wrapT: RepeatWrapping,
        format: RGBAFormat,
      }
    );
    if (size && gl) {
      const texture = new DataTexture(
        getSphere(size * size, 128),
        size,
        size,
        RGBAFormat,
        FloatType
      );

      texture.needsUpdate = true;
      target.texture = texture;
    }
    return target;
  }

  const resizeAllFBO = useCallback(() => {
    const allKeys = Object.keys(fluidFbos.current);

    allKeys.forEach((key) => {
      fluidFbos.current[key].setSize(fboSize.current.x, fboSize.current.y);
    });
  }, [fluidFbos]);

  const boundarySpace = useMemo(() => cellScale.current, []);

  const defaultProps = {
    gl,
    boundarySpace,
    cellScale: cellScale.current,
    fboSize: fboSize.current,
  };

  const advection = new Advection({
    ...defaultProps,
    dst: fluidFbos.current.vel_1,
    dt: options.current.dt,
    src: fluidFbos.current.vel_0,
  });

  const externalForce = new ExternalForce({
    ...defaultProps,
    dst: fluidFbos.current.vel_1,
    cursorSize: options.current.cursorSize,
  });

  const viscous = new Viscous({
    ...defaultProps,
    velocity: fluidFbos.current.vel_1,
    v: options.current.viscous,
    dt: options.current.dt,
    dst: fluidFbos.current.vel_viscous1,
    dst1: fluidFbos.current.vel_viscous0,
  });

  const divergence = new Divergence({
    ...defaultProps,
    dt: options.current.dt,
    velocity: fluidFbos.current.vel_viscous0,
    dst: fluidFbos.current.div,
  });

  const poisson = new Poisson({
    ...defaultProps,
    divergence: fluidFbos.current.div,
    dst: fluidFbos.current.pressure_1,
    dst1: fluidFbos.current.pressure_0,
  });

  const pressurePass = new Pressure({
    ...defaultProps,
    dt: options.current.dt,
    velocity: fluidFbos.current.vel_viscous0,
    pressure: fluidFbos.current.pressure_0,
    dst: fluidFbos.current.vel_0,
  });

  const position = new Position({
    ...defaultProps,
    velocity: fluidFbos.current.vel_0,
    dst: particleFbos.current.position_0,
    dst1: particleFbos.current.position_1,
  });

  useEffect(() => {
    const handleMouse = (ev: MouseEvent) => {
      coords.current = {
        x: (ev.clientX / window.innerWidth) * 2 - 1,
        y: -(ev.clientY / window.innerHeight) * 2 + 1,
      };
    };
    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  useFrame(({ clock }) => {
    advection.update({ dt: options.current.dt });
    externalForce.update({
      pointer: new Vector2(coords.current.x, coords.current.y),
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
      : fluidFbos.current.vel_1;

    divergence.update({ velocity });

    const pressure = poisson.update({
      iterations: options.current.iterations,
    });

    pressurePass.update({ velocity, pressure });

    position.update({
      velocity: fluidFbos.current.vel_0,
      time: clock.getElapsedTime(),
    });

    const render = renderRef.current;
    if (render) {
      render.uniforms.positions.value = particleFbos.current.position_0.texture;
      render.uniforms.uTime.value = clock.elapsedTime;
      render.uniforms.uFboSize.value = fboSize.current;
      render.uniforms.uFocus.value = MathUtils.lerp(
        render.uniforms.uFocus.value,
        options.current.focus,
        0.1
      );
      render.uniforms.uBlur.value = MathUtils.lerp(
        render.uniforms.uBlur.value,
        options.current.aperture,
        0.1
      );
      render.uniforms.uColor.value =
        resolvedTheme === "light"
          ? new Vector3(0.215, 0.231, 0.223)
          : new Vector3(0.69, 0.709, 0.682);
    }
  });

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
      resizeAllFBO();
    };
    document.body.addEventListener("resize", recalcSize, false);
    return () => {
      document.body.removeEventListener("resize", recalcSize);
    };
  }, [resizeAllFBO, size, size.height, size.width]);

  return (
    <>
      <scene ref={sceneRef}>
        <points>
          <dofPointsMaterial ref={renderRef} particleLength={particleLength} />
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particles.length / 3}
              array={particles}
              itemSize={3}
            />
          </bufferGeometry>
        </points>
        <DebugView
          texture={fluidFbos.current.vel_0.texture}
          camera={camera as PerspectiveCamera}
        />
      </scene>
    </>
  );
};

const DebugView = ({
  texture,
  camera,
}: {
  texture: Texture;
  camera: PerspectiveCamera;
}) => {
  texture.needsUpdate = true;
  const material = new MeshBasicMaterial({
    map: texture,
    side: DoubleSide,
    opacity: 0.03,
    transparent: true,
  });

  function calculateVisibleDimensions(camera: PerspectiveCamera) {
    const height =
      2 * Math.tan(MathUtils.degToRad(camera.fov) / 2) * camera.position.z;
    const width = height * camera.aspect;
    return { width, height };
  }
  const { width, height } = calculateVisibleDimensions(camera);
  const geometry = new PlaneGeometry(width, height); // Full viewport quad

  return <primitive object={new Mesh(geometry, material)} />;
};

const ParticleCanvas = () => {
  return (
    <Canvas
      id="particle-canvas"
      style={{ position: "absolute" }}
      className="left-0 z-0 opacity-80"
      gl={{ antialias: true, alpha: true, autoClear: false }}
      camera={{
        position: [0, 0, 5],
        fov: 8,
      }}
    >
      <ParticleScene />
      {/* <Stats /> */}
    </Canvas>
  );
};

export default ParticleCanvas;
