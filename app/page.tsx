"use client";

import Effect from "@/components/Backdrop/Effect";
import ParticlesCanvas from "@/components/Canvases/ParticlesCanvas";
import MenuCard from "@/components/Cards/MenuCard";
import Grid from "@/components/Grid";
import Loading from "@/components/Loading";
import Overlay from "@/components/Overlay";
import { useResizeGridUpdate } from "@/lib/clientUtils";
import { GridContext } from "@/lib/state";
import "@radix-ui/themes/styles.css";
import { AnimatePresence, motion, useAnimate } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { useLoading } from "./providers";

export default function Hero() {
  const [loadingPromises] = useLoading();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [finsihedLoading, setFinsihedLoading] = useState(false);
  const [scope, animate] = useAnimate();
  const context = useContext(GridContext)!;
  useResizeGridUpdate(context);

  useEffect(() => {
    let resolvedCount = 0;
    const updateProgress = () => {
      resolvedCount++;
      setLoadingProgress((resolvedCount / loadingPromises.length) * 100);
    };
    loadingPromises.forEach((promise) => {
      promise
        .then(() => {
          updateProgress();
        })
        .catch((error) => {
          // Handle or ignore errors
          console.error("A promise failed to resolve:", error);
          updateProgress();
        });
    });
  }, [animate, loadingPromises]);

  // Empty dependency array means this effect runs once on mount
  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <>
          <motion.div
            key={"slide-in"}
            className="fixed left-0 top-0 bg-black z-50 origin-bottom w-screen h-screen"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 0 }}
            exit={{ scaleY: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
          <Loading prog={loadingProgress} ref={scope} setLoading={setLoading} />
        </>
      ) : (
        <>
          <motion.div
            key={"slide-out"}
            className="fixed left-0 top-0 bg-black z-50 origin-top w-screen h-screen"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            exit={{ scaleY: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
          <Overlay />
          <Grid/>

          <ParticlesCanvas></ParticlesCanvas>
          <MenuCard className="bottom-g-y-4/8 left-1/2 -translate-x-1/2 z-50" />
          <Effect />
        </>
      )}
      {/* <AnimatePresence mode="wait">
        {loading ? (

        ) : (
          
        )}
      </AnimatePresence> */}
    </AnimatePresence>
  );
}
