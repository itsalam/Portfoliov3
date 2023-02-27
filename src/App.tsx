import { Fragment, Suspense, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Theme from "./themes/DomainWarpTheme";
import Theme2 from "./themes/SmileyTheme";
import { Html, OrbitControls, useProgress } from '@react-three/drei';
import { useControls } from 'leva';
import Toolbar from './components/Toolbar';
import Content from './components/Content';

function App() {

  const themes = [Theme, Theme2];
  const canvasRef = useRef<HTMLDivElement>(null);
  function Loader() {
    const { progress } = useProgress()
    return <Html center>{progress} % loaded</Html>
  }

  const {theme} = useControls("Theme",
    {theme: {options:{ "Domain-Warp": 0, "Smiley":1}}
    }
  );

  const ThemeLoader = (idx:number) => {
    const ActiveTheme = themes[idx];
    return <Suspense fallback={<Loader />}>
    {<ActiveTheme elementRef={canvasRef} />}
  </Suspense>
  }

  return (<div className="w-screen h-screen flex flex-col">
      <div className="canvas-holder absolute w-screen h-screen z-[-1]" ref={canvasRef}>
        <div className="fixed w-full h-full bg-slate-900/70"/>
        <Canvas shadows="percentage" className="z-[-2]">
          <OrbitControls/>
          {ThemeLoader(theme)}
        </Canvas>
      </div>
      <div id="header" className="w-screen flex h-20 z-10">
        <Toolbar/>
      </div>
      <Content/>
  </div>
    
  )
}

export default App
