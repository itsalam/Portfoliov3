"use client";

import { GridContext, useGridStore } from "@/lib/state";
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
  const store = useRef(useGridStore);

  const [loadingProg, setLoading] = useState<Promise<void>[]>(
    Array.from({ length: 5 }, (_, i) => {
      return new Promise<void>((resolve) => {
        const randomDelay = Math.floor(Math.random() * (i * 50)) + 50;
        setTimeout(() => {
          resolve();
        }, randomDelay);
      });
    })
  );

  return (
    <ThemeProvider attribute="class">
      <LoadingContext.Provider value={[loadingProg, setLoading]}>
        <GridContext.Provider value={store.current}>
          {props.children}
        </GridContext.Provider>
      </LoadingContext.Provider>
    </ThemeProvider>
  );
}

export const useLoading = () => useContext(LoadingContext);
