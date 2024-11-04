import { MutableRefObject, createContext } from "react";
import { createStore } from "zustand";
import { SchemaStores, createCMSSlices } from "./fetchData";

export const CMSContext = createContext<ReturnType<typeof useCMSStore> | null>(
  null
);

export const useCMSStore = (loadingRef: MutableRefObject<Promise<void>[]>) =>
  createStore<Partial<SchemaStores>>()((set) => {
    return {
      initialize: () => {
        const slices = createCMSSlices(set);
        const allCMSLoaded = Promise.all<void>(slices).then(() => {});
        loadingRef.current = loadingRef.current.concat([
          allCMSLoaded,
          ...slices,
        ]);
      },
    };
  });
