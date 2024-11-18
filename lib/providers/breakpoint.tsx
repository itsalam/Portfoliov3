import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type BreakpointContextType = keyof typeof BREAKPOINTS | undefined;

const BreakpointContext = createContext<BreakpointContextType>(undefined);

const BREAKPOINTS: Record<string, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export const useBreakpoints = () => {
  return useContext(BreakpointContext);
};

export const BreakpointProvider: React.FC<{
  breakpoints?: typeof BREAKPOINTS;
  children: React.ReactNode;
}> = ({ children, breakpoints = BREAKPOINTS }) => {
  const searchBreakpoint = useCallback((
    breakpoints: { key: string; value: number }[]
  ) => {
    if (typeof window === "undefined") return;
    return breakpoints.find((x) => window.innerWidth < x.value)?.key;
  }, []);

  const entries = useMemo(
    () =>
      Object.entries(breakpoints)
        .sort((a, b) => a[1] - b[1])
        .map(([key, value]) => ({ key, value })),
    [breakpoints]
  );

  const [breakpoint, setBreakpoint] = useState<BreakpointContextType>(
    searchBreakpoint(entries)
  );

  useEffect(() => {
    const onResize = () => {
      setBreakpoint(searchBreakpoint(entries));
    };

    window.addEventListener("resize", onResize);
    // Set initial breakpoint
    onResize();
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [entries, searchBreakpoint]);

  return (
    <BreakpointContext.Provider value={breakpoint}>
      {children}
    </BreakpointContext.Provider>
  );
};
