"use client";

import { cn } from "@/lib/utils";
import "@radix-ui/themes/styles.css";
import { motion, useAnimate } from "framer-motion";
import { Haze } from "lucide-react";
import { ComponentProps } from "react";
import Card from "../Card";

export default function LocationCard(props: ComponentProps<typeof motion.div>) {
  const { className, ...rest } = props;
  const [projectsRef] = useAnimate();
  const Item = () => (
    <motion.div className="aspect-square w-g-x-4/8 rounded-full bg-white">
      <Haze className="text-red-500 m-auto" />
    </motion.div>
  );
  return (
    <Card
      {...rest}
      className={cn(
        "flex flex-col absolute w-g-x-1 h-g-y-5 gap-4 items-center justify-evenly",
        className
      )}
      ref={projectsRef}
      initial="initial"
      id="menu"
      key={"menu"}
      onMouseOver={() => {}}
    >
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <Item key={i} />
        ))}
    </Card>
  );
}
