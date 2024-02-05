import { AnimationControls, useAnimation } from "framer-motion";
import { debounce } from "lodash";
import { usePathname, useRouter } from "next/navigation";
import { RefObject, useEffect, useMemo, useRef } from "react";

export const useScrollNavigation = (
  ref: RefObject<HTMLElement>,
  disable?: boolean,
  animationCallback?: (anim: AnimationControls) => void
) => {
  const isMounted = useRef(false);
  const controls = useAnimation();
  const router = useRouter();
  const pathname = usePathname();
  const PATHS = useMemo(() => ["/", "/about"], []);

  useEffect(() => {
    const handleScroll = debounce(
      (ev: WheelEvent) => {
        const index = PATHS.indexOf(pathname);
        const direction = ev.deltaY > 0 || ev.deltaX > 0 ? 1 : -1;
        controls.stop();
        if (!disable && isMounted.current && PATHS[index + direction]) {
          controls.start("exit").then(() => {
            setTimeout(() => {
              router.push(PATHS[index + direction]);
            }, 400);
          });
        }
      },
      100,
      { leading: true }
    );

    isMounted.current = true;
    const refElem = ref.current;
    if (ref.current) {
      ref.current.addEventListener("wheel", handleScroll, { passive: true });
    }
    return () => {
      if (refElem) {
        refElem.removeEventListener("wheel", handleScroll);
      }
      isMounted.current = false;
    };
  }, [PATHS, pathname, ref, router, controls, disable]);

  useEffect(() => {
    isMounted.current = true;

    controls.start("animate").then(() => {
      if (isMounted.current && animationCallback) {
        animationCallback(controls);
      }
    });

    return () => {
      isMounted.current = false;
    };
  }, [animationCallback, controls, isMounted]);

  return { controls, isMounted };
};

export const useResizeCallBack = (
  ref: RefObject<HTMLElement>,
  cb: () => void
) => {
  useEffect(() => {
    const element = ref.current;
    window.addEventListener("resize", cb);
    if (element) {
      const resizeObserver = new ResizeObserver(() => {
        cb();
      });
      resizeObserver.observe(element);
      return () => {
        resizeObserver.unobserve(element);
        window.removeEventListener("resize", cb);
      };
    }
    return () => window.removeEventListener("resize", cb);
  }, [cb, ref]);
};

export const animateTransition = {
  initial: {
    y: "100%",
    opacity: 0.0,
  },
  animate: {
    y: "0%",
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    y: "-100%",
    opacity: 0.0,
    transition: {
      duration: 0.133,
    },
  },
};
