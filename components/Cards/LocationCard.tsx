"use client";

import { TitleCard } from "@/components/Card";
import { cn } from "@/lib/utils";
import "@radix-ui/themes/styles.css";
import { motion, useAnimate } from "framer-motion";
import { ComponentProps } from "react";
import Map from "react-map-gl";
import { CARD_TYPES } from "./types";

export default function LocationCard(props: ComponentProps<typeof motion.div>) {
  const { className, ...rest } = props;
  const [projectsRef] = useAnimate();
  return (
    <TitleCard
      {...rest}
      containerClassName={className}
      className={cn("flex relative w-g-x-4-4/8 h-g-y-3 gap-4")}
      title={CARD_TYPES.Location}
      ref={projectsRef}
      initial="initial"
      id={CARD_TYPES.Location}
      key={"location"}
    >
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_KEY ?? ""}
        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
          zoom: 14,
        }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
      />
    </TitleCard>
  );
}
