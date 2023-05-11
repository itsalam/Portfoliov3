import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { DefaultLoader } from "@src/etc/Helpers";
import useStore from "@src/store";
import { Suspense, useCallback } from "react";

export default function Background() {
    const { themes } = useStore.getState();
    const { activeTheme, bgOpacity } =
        useStore();

    function ThreeJsLoader() {
        return (
            <Html center>
                <DefaultLoader />
            </Html>
        );
    }

    const Theme = useCallback(() => {
        const Background = themes[activeTheme].background;
        return <Suspense fallback={<ThreeJsLoader />}>
            <Background {...useThree()} />
        </Suspense>

    }, [activeTheme]);

    return <div
        className="canvas-holder bg-base fixed z-[-1] h-screen w-screen"
        style={{ opacity: bgOpacity }}
    >
        <Canvas
            id="canvas"
            shadows="percentage"
            className="intro-revealer z-[-2]"
            style={{ opacity: 0 }}
        >
            <OrbitControls />
            <Theme />
        </Canvas>
    </div>
}