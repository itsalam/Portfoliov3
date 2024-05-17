"use client";

import ParticlesCanvas from "@/components/Canvases/ParticlesCanvas";
import MenuCard from "@/components/Cards/MenuCard";
import Grid from "@/components/Grid/Grid";
import Loading from "@/components/Loading";
import Overlay from "@/components/Overlay";
import { useCMSStoreInitializer, useResizeGridUpdate } from "@/lib/hooks";
import { CMSContext, GridContext } from "@/lib/state";
import { ThemePanel } from "@radix-ui/themes";
import { useAnimate } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import "./globals.css";
import { useLoading } from "./providers";

export default function Hero() {
  const [loadingPromises] = useLoading();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scope, animate] = useAnimate();
  const cmsApi = useContext(CMSContext)!;
  const gridApi = useContext(GridContext)!;
  useResizeGridUpdate(gridApi);
  useCMSStoreInitializer(cmsApi);

  const useThemePanel = process.env.NEXT_PUBLIC_USE_THEME_PANEL;

  useEffect(() => {
    let resolvedCount = 0;
    const updateProgress = () => {
      resolvedCount++;
      setLoadingProgress(~~((resolvedCount / loadingPromises.length) * 100));
    };
    loadingPromises.forEach((promise) => {
      promise
        .then(() => {
          updateProgress();
        })
        .catch((error) => {
          console.error("A promise failed to resolve:", error);
          updateProgress();
        });
    });
  }, [animate, loadingPromises]);

  // Empty dependency array means this effect runs once on mount
  return (
    <>
      {loading ? (
        <Loading prog={loadingProgress} ref={scope} setLoading={setLoading} />
      ) : (
        <>
          <Grid />
          <Overlay />
          <MenuCard
            className={
              "bottom-g-2/8 left-1/2 z-50 -translate-x-1/2 transition-bg"
            }
          />
          {useThemePanel && <ThemePanel defaultOpen={false} />}
        </>
      )}
      <ParticlesCanvas />
    </>
  );
}
