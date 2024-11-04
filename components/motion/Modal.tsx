import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";
import { FC, ReactNode, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  children: ReactNode;
  target?: HTMLElement;
}

const Modal: FC<ModalProps> = ({
  isOpen,
  onClose,
  target = document.body,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;
    const listener = (event: MouseEvent | TouchEvent) => {
      if (
        currentRef &&
        (currentRef == event.target || currentRef.children[0] == event.target)
      ) {
        onClose?.();
      }
    };

    currentRef?.addEventListener("mousedown", listener);
    currentRef?.addEventListener("touchstart", listener);

    return () => {
      currentRef?.removeEventListener("mousedown", listener);
      currentRef?.removeEventListener("touchstart", listener);
    };
  }, [ref, onClose, isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={ref}
      className={cn(
        "absolute", // basicStyles
        "top-0 z-40 flex h-full w-full", // positioning, layoutControl, sizing
        "justify-center bg-black/50" // layout, background
      )}
    >
      <div
        className={cn(
          "md:w-2/3 md:flex-col",
          "flex w-full max-w-4xl", // sizing
          "flex-col-reverse items-center justify-start gap-4 py-8" // layout, padding
        )}
      >
        <AnimatePresence>{children}</AnimatePresence>
      </div>
    </div>,
    target
  );
};

export default Modal;
