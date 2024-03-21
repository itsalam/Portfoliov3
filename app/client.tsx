"use client";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

// Client wraps any client/rsc components with AnimatePresence
export default function Client({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ y: "-20%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1, transition: { duration: 0.4 } }}
        exit={{ x: "20%", opacity: 0, transition: { duration: 0.4 } }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
