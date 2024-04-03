"use client";

import { Spinner } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { DynamicOptionsLoadingProps } from "next/dynamic";

export default function LoadingCard(props: DynamicOptionsLoadingProps) {
  return (
    <motion.div
      className="flex h-full w-full items-center justify-center"
      {...props}
    >
      <Spinner size={"3"} />
    </motion.div>
  );
}
