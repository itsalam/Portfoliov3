"use client";

import { p3ColorToArr } from "@/lib/clientUtils";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
// import { GUI } from "dat.gui";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Camera,
  Color,
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
  TextureDataType,
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

type PointEvent = {
  clientX: number;
  clientY: number;
};

function calculateVisibleDimensions(
  camera: Camera & { fov: number; aspect: number }
) {
  const height =
    2 * Math.tan(MathUtils.degToRad(camera.fov) / 2) * camera.position.z;
  const width = height * camera.aspect;
  return new Vector2(width, height);
}

function getPoint(
  v: Vector4,
  size: number,
  data: Float32Array,
  offset: number,
  bounds: Vector2
) {
  v.set(
    (Math.random() - 0.5) * bounds.x,
    (Math.random() - 0.5) * bounds.y,
    Math.random() - 0.5,
    1000
  );
  // if (v.length() > 1) return getPoint(v, size, data, offset);
  return v.toArray(data, offset);
}

function initializePoints(count: number, size: number, bounds: Vector2) {
  const data = new Float32Array(count * 4);
  for (let i = 0; i < count * 4; i += 4)
    getPoint(new Vector4(), size, data, i, bounds);
  return data;
}

function cssColorToGLSLVec3(cssVarName: string) {
  return new Vector3(...p3ColorToArr(cssVarName));
}

const ParticleScene = () => {
  const coords = useRef({ x: 0, y: 0 });
  const particleLength = 60;
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

  const accentColor = useMemo(
    () =>
      cssColorToGLSLVec3(
        resolvedTheme === "light" ? "--accent-3" : "--accent-8"
      ),
    [resolvedTheme]
  );
  const grayColor = useMemo(
    () =>
      cssColorToGLSLVec3(resolvedTheme === "light" ? "--gray-3" : "--gray-12"),
    [resolvedTheme]
  );

  // SHADER CONFIGURATION
  const options = useRef({
    dt: 0.002,
    cursorSize: 0.03,
    mouseForce: 4.0,
    resolution: 1.0,
    viscous: 200,
    iterations: 4,
    isViscous: true,
    aperture: 40.0,
    fov: 3.5,
    focus: 2.6,
    accent: accentColor,
    color: grayColor,
  });

  const type = useRef(
    (/(iPad|iPhone|iPod)/g.test(navigator.userAgent)
      ? HalfFloatType
      : FloatType) as TextureDataType
  );
  const width = useRef(Math.round(size.width * options.current.resolution));
  const height = useRef(Math.round(size.height * options.current.resolution));
  const cellScale = useRef(new Vector2(1 / width.current, 1 / height.current));
  const fboSize = useRef(new Vector2(width.current, height.current));
  const povSize = useRef(
    calculateVisibleDimensions(camera as PerspectiveCamera)
  );

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
  //   gui.add(optionsCur, "mouseForce", 0, 20);
  //   gui.add(optionsCur, "focus", 0, 4);
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
        type: type.current,
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        wrapS: RepeatWrapping,
        wrapT: RepeatWrapping,
        format: RGBAFormat,
      }
    );
    if (size && gl) {
      const texture = new DataTexture(
        initializePoints(
          size * size,
          128,
          calculateVisibleDimensions(camera as PerspectiveCamera)
        ),
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
    povSize: povSize.current,
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
    factor: options.current.mouseForce,
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
    cameraPos: camera.position.z,
    cameraFov: (camera as PerspectiveCamera).fov,
    cameraAspect: (camera as PerspectiveCamera).aspect,
  });

  useEffect(() => {
    const handleMove = (point: PointEvent) => {
      coords.current = {
        x: (point.clientX / window.innerWidth) * 2 - 1,
        y: -(point.clientY / window.innerHeight) * 2 + 1,
      };
    };
    const handleTouch = (ev: TouchEvent) => {
      handleMove(ev.touches[0]);
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("touchmove", handleTouch, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleTouch);
    };
  }, []);

  useFrame(({ clock }) => {
    advection.update({ dt: options.current.dt });
    externalForce.update({
      pointer: new Vector2(coords.current.x, coords.current.y),
      cursorSize: options.current.cursorSize,
      factor: options.current.mouseForce,
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
      camera: camera as PerspectiveCamera,
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
    }
  });

  useEffect(() => {
    const render = renderRef.current;
    if (render) {
      render.uniforms.uColor.value = grayColor;
      render.uniforms.uAccent.value = accentColor;
    }
  }, [accentColor, grayColor, resolvedTheme]);

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
  }, [camera, resizeAllFBO, size, size.height, size.width]);

  return (
    <>
      <scene ref={sceneRef}>
        <points>
          <dofPointsMaterial
            toneMapped={false}
            ref={renderRef}
            particleLength={particleLength}
          />
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
          texture={fluidFbos.current.vel_1.texture}
          camera={camera as PerspectiveCamera}
          resolvedTheme={resolvedTheme}
        />
      </scene>
    </>
  );
};

const DebugView = ({
  texture,
  camera,
  resolvedTheme,
}: {
  texture: Texture;
  camera: PerspectiveCamera;
  resolvedTheme?: string;
}) => {
  texture.needsUpdate = true;
  const material = new MeshBasicMaterial({
    map: texture,
    side: DoubleSide,
    opacity: resolvedTheme == "light" ? 0.1 : 0.1,
    transparent: true,
    color: new Color(0x145750),
  });

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
        position: [0, 0, 1],
        fov: 75,
      }}
    >
      <ParticleScene />
    </Canvas>
  );
};

export default ParticleCanvas;
