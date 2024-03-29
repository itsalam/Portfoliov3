"use client";

import {
  CMSContext,
  GridContext,
  useCMSStore,
  useGridStore,
} from "@/lib/state";
import { ThemeProvider } from "next-themes";
import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useRef,
  useState,
} from "react";

type LoadingContextType = [
  Promise<void>[],
  Dispatch<SetStateAction<Promise<void>[]>>,
];

const LoadingContext = createContext<LoadingContextType>([[], () => {}]);

export function Providers(props: { children: ReactNode }) {
  const [loadingProg, setLoading] = useState<Promise<void>[]>(
    Array.from({ length: 5 }, (_, i) => {
      return new Promise<void>((resolve) => {
        const randomDelay = Math.floor(Math.random() * (i * 1000)) + 50;
        setTimeout(() => {
          resolve();
        }, randomDelay);
      });
    })
  );

  const gridStore = useRef(useGridStore);
  const cmsStore = useCMSStore(setLoading);
  const cmsRef = useRef(cmsStore);

  return (
    <ThemeProvider attribute="class">
      <LoadingContext.Provider value={[loadingProg, setLoading]}>
        <CMSContext.Provider value={cmsRef.current}>
          <GridContext.Provider value={gridStore.current}>
            {props.children}
          </GridContext.Provider>
        </CMSContext.Provider>
      </LoadingContext.Provider>
    </ThemeProvider>
  );
}

export const useLoading = () => useContext(LoadingContext);
