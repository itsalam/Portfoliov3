"use client";

import ParticleCanvas from "@/components/Canvases/ParticlesCanvas";
import { CARD_TYPES } from "@/components/Cards/types";
import {
  CARD_MENU_GROUP,
  DEFAULT_GRID_ELEMENTS,
} from "@/components/Grid/consts";
import Loading from "@/components/Loading";
import { useCMSStoreInitializer, useWebGLSupport } from "@/lib/hooks";
import { BreakpointProvider } from "@/lib/providers/breakpoint";
import { GridContext, createGridStore } from "@/lib/providers/clientState";
import { CMSContext, useCMSStore } from "@/lib/providers/state";
import { cn, createThrottleQueue } from "@/lib/utils";
import {
  AnimatePresence,
  LazyMotion,
  domAnimation,
  domMax,
} from "framer-motion";
import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Main from "./main";

export function Providers() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const loadingRef = useRef<Promise<void>[]>([]);
  const [loading, setLoading] = useState(true);
  const webgl = useWebGLSupport();

  useEffect(() => {
    const artificalLoading = Array.from({ length: 5 }, (_, i) => {
      return new Promise<void>((resolve) => {
        const randomDelay = Math.floor(Math.random() * (i * 50));
        setTimeout(() => {
          resolve();
        }, randomDelay);
      });
    });
    loadingRef.current = loadingRef.current.concat(artificalLoading);
  }, []);

  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const baseName = pathnameRef.current
    .split("/")
    .filter(Boolean)[0] as keyof typeof CARD_MENU_GROUP;

  const initialCards = useRef(
    CARD_MENU_GROUP[baseName] ?? CARD_MENU_GROUP.home
  );

  const activeCard = useRef(
    Object.entries(DEFAULT_GRID_ELEMENTS).find(([k, v]) => {
      return initialCards.current.includes(k as CARD_TYPES) && v.canExpand;
    })?.[0] as CARD_TYPES
  );

  const gridStore = useRef(
    createGridStore({
      activeCard: activeCard.current,
      initialCards: initialCards.current,
    })
  );

  const cmsRef = useRef(useCMSStore(loadingRef));
  const currLoaded = useRef(0);

  useCMSStoreInitializer(cmsRef.current);

  const Canvas = useCallback(() => <ParticleCanvas />, []);

  useEffect(() => {
    const updateProgress = createThrottleQueue(() => {
      currLoaded.current++;
      setLoadingProgress(
        ~~((currLoaded.current / loadingRef.current.length) * 100) - 1
      );

      if (currLoaded.current >= loadingRef.current.length) {
        setTimeout(() => {
          setLoadingProgress(100);
        }, 1200);
      }
    }, [50, 300]);
    loadingRef.current.forEach((promise) => {
      promise
        .then(() => {
          updateProgress();
        })
        .catch((error) => {
          console.error("A promise failed to resolve:", error);
          updateProgress();
        });
    });
  }, [loadingRef]);

  return (
    <ThemeProvider attribute="class">
      <BreakpointProvider>
        <CMSContext.Provider value={cmsRef.current}>
          <GridContext.Provider value={gridStore.current}>
            <LazyMotion features={webgl ? domMax : domAnimation}>
              <AnimatePresence mode="wait">
                {loading ? (
                  <Loading
                    key={"loading"}
                    prog={loadingProgress ?? 0}
                    setLoading={setLoading}
                  />
                ) : (
                  <main
                    key="main"
                    id="main"
                    className={cn(
                      "z-10", // layoutControl
                      "flex h-screen max-h-[100dvh] container", // sizing
                      "flex-col items-center justify-center overflow-hidden" // layout, overflowControl
                    )}
                  >
                    <Main />
                  </main>
                )}
              </AnimatePresence>
            </LazyMotion>
            <Canvas />
          </GridContext.Provider>
        </CMSContext.Provider>
      </BreakpointProvider>
    </ThemeProvider>
  );
}
