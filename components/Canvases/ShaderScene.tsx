import { extend, useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { Mesh } from 'three';
import Shader from "./Helper";


extend({ Shader });

const MovingPlane = () => {
  // This reference will give us direct access to the mesh
  const mesh = useRef<Mesh>(null);
  const { size } = useThree();
  const materialRef = useRef();



  useFrame((state) => {
    const material = materialRef.current;
    if(!material) return;
    const { clock } = state;
    material.time = clock.getElapsedTime();
  });

  return (
    <mesh ref={mesh} position={[30, 0, -50]}  rotation={[0, Math.PI/5, 0]} scale={4}>
      <torusGeometry args={[15, 5, 50, 16]} />
      <pointsMaterial   
        transparent
        vertexColors
        color={"#ff0000"} 
        size={0.5}
        />
    </mesh>
  );
};

// <LayerMaterial lighting="phong" color="black">
// {/* First layer is our own custom layer that's based of the FBM shader */}
// {/* 
//   Notice how we can use *any* uniforms as prop here 👇
//   You can tweak the colors by adding a colorA or colorB prop!
// */}
// <shader ref={materialRef} time={0.0} />
// {/* Second layer is a depth based gradient that we "add" on top of our custom layer*/}
// {/* <Depth colorA="blue" colorB="aqua" alpha={0.3} mode="add" /> */}
// {/* Third Layer is a Fresnel shading effect that we add on*/}
// {/* <Fresnel color="#B1F1CB" mode="add" /> */}
// </LayerMaterial>

export default MovingPlane;