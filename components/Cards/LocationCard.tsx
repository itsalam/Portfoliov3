"use client";

import { TitleCard } from "@/components/Card";
import { useScrollNavigation } from "@/lib/clientUtils";
import { cn } from "@/lib/utils";
import "@radix-ui/themes/styles.css";
import { motion, useAnimate } from "framer-motion";
import { ComponentProps } from "react";
import Map from "react-map-gl";

export default function LocationCard(props: ComponentProps<typeof motion.div>) {
  const { className, ...rest } = props;
  const [projectsRef] = useAnimate();
  const { controls } = useScrollNavigation(projectsRef, true);

  return (
    <TitleCard
      {...rest}
      containerClassName={className}
      className={cn("flex relative w-g-x-3 h-g-y-2 gap-4")}
      title="Location"
      animate={controls}
      ref={projectsRef}
      initial="initial"
      id="location"
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
