"use client";

import { TitleCard } from "@/components/Card";
import { cn } from "@/lib/utils";
import "@radix-ui/themes/styles.css";
import { motion } from "framer-motion";
import { ComponentProps, useRef } from "react";
import Map, { MapRef } from "react-map-gl";
import { CARD_TYPES } from "./types";

export default function LocationCard(props: ComponentProps<typeof motion.div>) {
  const { className, ...rest } = props;
  const projectsRef = useRef(null);
  const mapRef = useRef<MapRef>(null);
  return (
    <TitleCard
      {...rest}
      containerClassName={cn(className)}
      className={cn("flex relative gap-4 h-full w-full")}
      title={CARD_TYPES.Location}
      ref={projectsRef}
      initial="initial"
      id={CARD_TYPES.Location}
      onAnimationComplete={() => mapRef.current?.resize()}
      key={"location"}
    >
      <Map
        ref={mapRef}
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
