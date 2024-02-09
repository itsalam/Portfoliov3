import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, forwardRef, useEffect, useRef } from "react";
import { Group, MeshPhongMaterial, Object3DEventMap } from "three";
import Effects from "./Effects";

const M1 = forwardRef(({ texture, children, ...props }, ref) => {
  const { nodes } = useGLTF("/mac.glb");
  const m1 = useRef<Group<Object3DEventMap>>();
  console.log(nodes);
  const keyboardMaterial = new MeshPhongMaterial({
    color: 0x000000, // black
    specular: 0x050505, // slight specular
    shininess: 100, // high shininess to simulate plastic key surface
  });

  const metalMaterial = new MeshPhongMaterial({
    color: 0xa0a0a0, // gray
    specular: 0xffffff, // white specular
    shininess: 100, // high shininess to simulate metal surface
  });

  useEffect(() => {
    if (m1.current) {
      m1.current.traverse((node) => {
        if (
          node.name === "keyboard001" ||
          node.name === "trackpad_top" ||
          node.name === "screen001"
        ) {
          node.material = keyboardMaterial;
        } else {
          node.material = metalMaterial;
        }
      });
    }
  }, [m1.current]);

  return (
    <group {...props} dispose={null} ref={m1}>
      <group position={[0, 0, 0]} scale={1}>
        <primitive object={nodes["Macbook_Pro_M1_Max_14_Inch"]}>
          {/* <Outlines thickness={0.05} color="hotpink" /> */}
        </primitive>
        {/* <mesh geometry={nodes.base.geometry}>
          <meshStandardMaterial />
        </mesh>

        <mesh geometry={nodes.screen.geometry}>
          <meshStandardMaterial />
        </mesh> */}
      </group>
      {children}
    </group>
  );
});

M1.displayName = "M1"; // This is important for the detailed component to work
export default function HomeCanvas() {
  const m1Ref = useRef();

  return (
    <Suspense fallback={<span>loading...</span>}>
      <Canvas
        // Quick shortcut for setting up shadow maps
        style={{ position: "absolute" }}
        shadows
        
    colorManagement
        className="absolute top-0 left-0"
        // Only render on changes and movement
        frameloop="demand"
        camera={{ position: [0, 0, 50] }}
      >
        {/* Let's render 800 Bust components with the data above */}
        {/* {positions.map((props, i) => (
          <M1 key={i} {...props} scale={3} />
        ))} */}
        <pointLight position={[0, 0, 0]} intensity={100.0} />
        {/* <spotLight intensity={2.5} position={[50, 50, 50]} castShadow /> */}
        <Environment preset="city" />
        <ambientLight />
        <pointLight position={[-20, 20, 20]} />
        <M1
          ref={m1Ref}
          scale={7}
          position={[10, -10, 0]}
          rotation={[(-Math.PI * 4) / 10, -Math.PI / 4, -Math.PI / 8]}
        />

      {/* <color attach="background" args={["#050505"]} /> */}
      {/* <fog color="#161616" attach="fog" near={8} far={30} /> */}
        <OrbitControls zoomSpeed={0.5} />
        <Effects/>
      </Canvas>
    </Suspense>
  );
}
