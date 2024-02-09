"use client"

import { Environment, Line, OrbitControls, Plane, PointMaterial, Sphere } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useRef } from 'react';
import { createNoise3D } from 'simplex-noise';
import { Group, Vector3 } from 'three';

// const noise3D = (...args) => Math.random();
const noise3D = createNoise3D();
const FlowField = () => {
  const meshRef = useRef<Group>(null);


  const width = 10;
  const height = 10;
  const scale = 50;
  const points = Array.from({length: 400}).fill(1).map((data, i) => {
  const [x, y] = [Math.floor(i/20), i%20];
  const value2d = noise3D(x/25, y/25, 0);
    return <group position={[x * 5, y * 5, 0]} rotation={[0, 0, Math.PI * value2d]} key={i}>
    <mesh>
        <boxGeometry args={[1, 1, 1]} attach={"geometry"} />
        <meshBasicMaterial/>
    </mesh>
    <Line points={[new Vector3(0, 0,0), new Vector3(5,0,0)]}/>
    </group>
  }

);


// useFrame((state) => {
//     const mesh = meshRef.current;
//     if (mesh) {
//     mesh.traverse((node) => {
//         if (node instanceof Group && node !== mesh) {
//             node.rotation.z = noise3D(node.position.x/25, node.position.y/25, state.clock.elapsedTime * 0.01) * Math.PI;
//         }
//     })
//     }

//   })

  return (
    
    <group position={[-50, -50, 0]} ref={meshRef}>
        {points
        }
    </group>
  );
};

const App = () => {
  return (
    <Canvas        camera={{ position: [0, 0, 50] }}
    >
      {/* Let's render 800 Bust components with the data above */}
      {/* {positions.map((props, i) => (
        <M1 key={i} {...props} scale={3} />
      ))} */}
      {/* <pointLight position={[0, 0, 0]} intensity={10.0} /> */}
      {/* <spotLight intensity={2.5} position={[50, 50, 50]} castShadow /> */}
      <Environment preset="city" />
      <ambientLight />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <points >
        <planeGeometry args={[100, 100, 10, 10]} attach={"geometry"}/>
        <PointMaterial scale={15} depthWrite={false} />
      </points>
      <Plane args={[100, 100]}> 
      
        <meshStandardMaterial transparent opacity={0.5} color="red" />
      </Plane>

      <Sphere />
      <OrbitControls />
      <FlowField />
    </Canvas>
  );
};

export default App;
