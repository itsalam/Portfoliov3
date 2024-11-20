"use client";

import { cssVarToRGB } from "@/lib/providers/clientUtils";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
// import { GUI } from "dat.gui";
import { useWebGLSupport } from "@/lib/hooks";
import { TierResult, getGPUTier } from "detect-gpu";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
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
  NormalBlending,
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
} from "three";
import "./PointsMaterial";
import DofPointsMaterial from "./PointsMaterial";
import Advection from "./stages/Advection";
import Bloom from "./stages/Bloom";
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
  data: Float32Array,
  offset: number,
  bounds: Vector2
) {
  v.set(
    (-0.75 - Math.random()) * bounds.x,
    (Math.random() - 0.5) * bounds.y,
    Math.random() - 0.5,
    1000
  );
  // if (v.length() > 1) return getPoint(v, size, data, offset);
  return v.toArray(data, offset);
}

function initializePoints(count: number, bounds: Vector2) {
  const data = new Float32Array(count * 4);
  for (let i = 0; i < count * 4; i += 4)
    getPoint(new Vector4(), data, i, bounds);
  return data;
}

function cssColorToGLSLVec3(cssVarName: string) {
  const res = new Vector3(...cssVarToRGB(cssVarName));
  console.log(
    `%cColor: rgb(${res.x * 255}, ${res.y * 255}, ${res.z * 255})`,
    `color: rgb(${res.x * 255}, ${res.y * 255}, ${res.z * 255})`
  );
  return res;
}

const ParticleScene = (props: { gpuTier?: TierResult }) => {
  const { gpuTier } = props;
  const coords = useRef({ x: 0, y: 0 });
  const particleLength = (5 - (gpuTier?.tier ?? 5)) * 30;
  const { gl, size, camera, scene } = useThree();
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
        resolvedTheme === "light" ? "--accent-8" : "--accent-12"
      ),
    [resolvedTheme]
  );
  const grayColor = useMemo(
    () =>
      cssColorToGLSLVec3(
        resolvedTheme === "light" ? "--accent-8" : "--gray-12"
      ),
    [resolvedTheme]
  );

  // SHADER CONFIGURATION
  const options = useRef({
    dt: 0.0025,
    cursorSize: 0.03,
    mouseForce: 4.0,
    resolution: 0.5,
    viscous: 400,
    iterations: 2,
    isViscous: true,
    aperture: 12.0,
    fov: 3.5,
    focus: 3.1,
    accent: accentColor,
    color: grayColor,
    valuesUpdated: true,
  });

  const bloomOptions = useRef({
    luminanceThreshold: 0.1,
    intensity: 1.8,
    radius: 1.0,
  });

  const type = useRef<TextureDataType>(
    /(iPad|iPhone|iPod)/g.test(navigator.userAgent) ? HalfFloatType : FloatType
  );
  const width = useRef(Math.round(size.width * options.current.resolution));
  const height = useRef(Math.round(size.height * options.current.resolution));
  const cellScale = useRef(new Vector2(1 / width.current, 1 / height.current));
  const fboSize = useRef(new Vector2(width.current, height.current));
  const povSize = useRef(
    calculateVisibleDimensions(camera as PerspectiveCamera)
  );

  const particleTexture = useMemo(
    () =>
      new DataTexture(
        initializePoints(
          particleLength * particleLength,
          calculateVisibleDimensions(camera as PerspectiveCamera)
        ),
        particleLength,
        particleLength,
        RGBAFormat,
        type.current
      ),
    [camera, particleLength]
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
    position_0: createRenderTarget({ texture: particleTexture }),
    position_1: createRenderTarget({ texture: particleTexture }),
  });

  // useEffect(() => {
  //   const optionsCur = bloomOptions.current;
  //   const gui = new GUI();
  //   gui.add(optionsCur, "luminanceThreshold", 0, 1, 0.05);
  //   gui.add(optionsCur, "intensity", 0, 3, 0.05);
  //   gui.add(optionsCur, "radius", 0, 1, 0.05);
  //   gui.add(options.current, "dt", 0, 0.3);
  //   gui.add(options.current, "cursorSize", 0, 0.3);
  //   gui.add(options.current, "mouseForce", 0, 20);
  //   gui.add(options.current, "focus", 0, 4);
  //   gui.add(options.current, "aperture", 0, 40);
  //   gui.add(options.current, "fov", 0, 10);
  //   return () => {
  //     gui.destroy();
  //   };
  // });

  function createRenderTarget(options?: { texture: DataTexture }) {
    const { texture } = options ?? {};
    const target = new WebGLRenderTarget(
      texture?.image.width ?? fboSize.current.x,
      texture?.image.height ?? fboSize.current.y,
      {
        type: type.current,
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        wrapS: RepeatWrapping,
        wrapT: RepeatWrapping,
        format: RGBAFormat,
      }
    );
    if (texture) {
      // texture.needsUpdate = true;
      target.texture = texture.clone();
    }
    return target;
  }

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
    iterations: options.current.iterations,
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
    iterations: options.current.iterations,
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

  const bloomOutput = new WebGLRenderTarget(width.current, height.current, {});

  const bloom = new Bloom({
    dst: bloomOutput,
    gl,
    camera,
    width: width.current / 2,
    height: height.current / 2,
    renderer: gl,
    scene,
    ...bloomOptions.current,
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
    if (options.current.valuesUpdated) {
      externalForce.updateUniforms({
        cellScale: defaultProps.cellScale,
        factor: options.current.mouseForce,
        cursorSize: options.current.cursorSize,
      });
      advection.updateUniforms({ dt: options.current.dt });
      viscous.updateUniforms({
        viscous: options.current.viscous,
        iterations: options.current.iterations,
        dt: options.current.dt,
      });
      poisson.updateUniform({ iterations: options.current.iterations });
      const render = renderRef.current;
      if (render) {
        render.uniforms.uFocus.value = options.current.focus;
        render.uniforms.uBlur.value = options.current.aperture;
      }
      options.current.valuesUpdated = false;
    }
    const time = clock.elapsedTime;
    advection.update();
    externalForce.update({
      pointer: new Vector2(coords.current.x, coords.current.y),
      time,
    });

    const velocity = options.current.isViscous
      ? viscous.update()
      : fluidFbos.current.vel_1;

    divergence.update({ velocity });

    const pressure = poisson.update();

    pressurePass.update({ velocity, pressure });

    position.update({
      velocity: fluidFbos.current.vel_0,
      time,
      camera: camera as PerspectiveCamera,
    });

    const render = renderRef.current;
    if (render) {
      render.uniforms.positions.value = particleFbos.current.position_0.texture;
      render.uniforms.uTime.value = clock.elapsedTime;
      render.uniforms.uFboSize.value = fboSize.current;
    }

    bloom.update(bloomOptions.current);
  });

  useEffect(() => {
    const render = renderRef.current;
    if (render) {
      render.uniforms.uColor.value = grayColor;
      render.uniforms.uAccent.value = accentColor;
      renderRef.current.blending =
        resolvedTheme === "light" ? NormalBlending : AdditiveBlending;
    }
  }, [accentColor, grayColor, resolvedTheme]);

  useEffect(() => {
    gl.autoClear = false;
    gl.setClearColor(0x000000);
    gl.setPixelRatio(window.devicePixelRatio * 0.5);
  }, [gl]);

  useEffect(() => {
    const curFluidFbos = fluidFbos.current;
    const curParticleFbos = particleFbos.current;
    Object.keys(curFluidFbos).forEach((key) => {
      fluidFbos.current[key].dispose();
      fluidFbos.current[key] = createRenderTarget();
    });
    Object.keys(curParticleFbos).forEach((key) => {
      particleFbos.current[key].dispose();
      particleFbos.current[key] = createRenderTarget({
        texture: particleTexture,
      });
    });
    return () => {
      Object.values(curFluidFbos).forEach((fbo) => {
        fbo.dispose();
        fbo.texture.dispose();
      });
      Object.values(curParticleFbos).forEach((fbo) => {
        fbo.dispose();
        fbo.texture.dispose();
      });
    };
  }, [particleTexture]);

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
          texture={fluidFbos.current.vel_0.texture}
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
    opacity: resolvedTheme == "light" ? 0.2 : 0.2,
    transparent: true,
    color: new Color(0x145750),
  });

  const { width, height } = calculateVisibleDimensions(camera);
  const geometry = new PlaneGeometry(width, height); // Full viewport quad

  return <primitive object={new Mesh(geometry, material)} />;
};

const ParticleCanvas = () => {
  const [gpuTier, setGpuTier] = useState<TierResult>();
  const webGLSupport = useWebGLSupport();

  useEffect(() => {
    const detectGPU = async () => {
      let gpuTier;
      if (webGLSupport) {
        gpuTier = await getGPUTier();
        setGpuTier(gpuTier);
      }
    };
    detectGPU();
  }, [webGLSupport]);

  if (!webGLSupport || !gpuTier) {
    return <></>;
  }

  return (
    <Canvas
      id="particle-canvas"
      style={{ position: "absolute" }}
      className="top-0 left-0 z-0 opacity-20 dark:opacity-40"
      gl={{ antialias: false, alpha: true, autoClear: false }}
      camera={{
        position: [0, 0, 1],
      }}
      dpr={0.5}
    >
      <ParticleScene gpuTier={gpuTier} />
    </Canvas>
  );
};

export default ParticleCanvas;
