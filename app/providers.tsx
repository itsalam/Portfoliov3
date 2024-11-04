"use client";

import ParticleCanvas from "@/components/Canvases/ParticlesCanvas";
import { CARD_TYPES } from "@/components/Cards/types";
import {
  CARD_MENU_GROUP,
  DEFAULT_GRID_ELEMENTS,
} from "@/components/Grid/consts";
import Loading from "@/components/Loading";
import { GridContext, useGridStore } from "@/lib/clientState";
import {
  useCMSStoreInitializer,
  useResizeGridUpdate,
  useWebGLSupport,
} from "@/lib/hooks";
import { CMSContext, useCMSStore } from "@/lib/state";
import { createThrottleQueue } from "@/lib/utils";
import { LazyMotion, domAnimation, domMax } from "framer-motion";
import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type LoadingContextType = {
  loadingPromises: Promise<void>[];
  setLoadingPromises: Dispatch<SetStateAction<Promise<void>[]>>;
  loadingProgress: number;
};

const LoadingContext = createContext<Partial<LoadingContextType>>({});

export function Providers(props: { children: ReactNode }) {
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
    useGridStore({
      activeCard: activeCard.current,
      initialCards: initialCards.current,
    })
  );
  const cmsRef = useRef(useCMSStore(loadingRef));
  const currLoaded = useRef(0);

  useResizeGridUpdate(gridStore.current);
  useCMSStoreInitializer(cmsRef.current);

  const Canvas = useCallback(() => <ParticleCanvas />, []);

  useEffect(() => {
    const updateProgress = createThrottleQueue(() => {
      currLoaded.current++;
      setLoadingProgress(
        ~~((currLoaded.current / loadingRef.current.length) * 100)
      );
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
      <CMSContext.Provider value={cmsRef.current}>
        <GridContext.Provider value={gridStore.current}>
          <LazyMotion features={webgl ? domMax : domAnimation}>
            {loading ? (
              <Loading prog={loadingProgress ?? 0} setLoading={setLoading} />
            ) : (
              props.children
            )}
          </LazyMotion>
          <Canvas />
        </GridContext.Provider>
      </CMSContext.Provider>
    </ThemeProvider>
  );
}

export const useLoading = () => useContext(LoadingContext);
