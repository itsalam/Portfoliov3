import dwThemes from "./DomainWarpTheme/colorScheme";
import smileyThemes from "./SmileyTheme/colorScheme";
import { extendTheme, VechaiTheme } from "@vechaiui/react";
import DWBackground from "./DomainWarpTheme";
import SmileyBackground from "./SmileyTheme";
import { create, StateCreator, StoreApi } from "zustand";

const theme = extendTheme({
  cursor: "pointer",
  colorSchemes: {
    ...dwThemes,
    ...smileyThemes,
  },
});

interface ThemeState {
  theme: string;
}

export const initDarkMode = (): boolean =>
  localStorage.theme === "dark" ||
  (!("theme" in localStorage) &&
    window.matchMedia("(prefers-color-scheme: dark)").matches);

export const checkDarkMode = (): boolean => {
  console.log(document.documentElement.classList);
  return document.documentElement.classList.contains("dark");
};

export const toggleDarkMode = (): void => {
  console.log("o");
  if (checkDarkMode()) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

export type ThemeStore = {
  vechaiTheme: VechaiTheme,
  themeOptions: {
    theme: {
      options: Record<string, {id: string, background:(props: {}) => JSX.Element}>
    },
  },
}

const createThemeSlice: StateCreator<any, [], [], ThemeStore> = (
  set:
    | StoreApi<unknown>
    | ((partial: unknown, replace?: boolean | undefined) => void)
    | (() => unknown)
):ThemeStore => ({
  vechaiTheme: theme,
  themeOptions: {
    theme: {
      options: {
        "Domain-Warp": {id: "dwTheme", background: DWBackground},
        Smiley: {id:"smileyTheme", background: SmileyBackground},
      },
    },
  },
});

export default createThemeSlice;
