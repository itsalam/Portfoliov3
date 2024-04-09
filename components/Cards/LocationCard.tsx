"use client";

import { useResizeCallBack } from "@/lib/clientUtils";
import { cn } from "@/lib/utils";
import { animate, motion } from "framer-motion";
import { debounce } from "lodash";
import { useTheme } from "next-themes";
import { ComponentProps, useRef } from "react";
import Map, { MapRef } from "react-map-gl";

export default function LocationCard(props: ComponentProps<typeof motion.div>) {
  const { className, ...rest } = props;
  const { resolvedTheme } = useTheme();
  const locationRef = useRef(null);
  const mapRef = useRef<MapRef>(null);
  const resizeMap = debounce(
    () => {
      mapRef.current?.resize();
    },
    1000,
    {
      trailing: true,
      maxWait: 2000,
    }
  );
  useResizeCallBack(resizeMap, locationRef);

  return (
    <motion.div
      className={cn("relative flex h-full w-full gap-4", className)}
      ref={locationRef}
      onAnimationComplete={resizeMap}
      {...rest}
    >
      <Map
        ref={mapRef}
        onResize={() => animate(locationRef.current, { opacity: 1 })}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_KEY ?? ""}
        initialViewState={{
          longitude: -123.12,
          latitude: 49.28,
          zoom: 5,
        }}
        mapStyle={
          resolvedTheme === "light"
            ? "mapbox://styles/mapbox/light-v11"
            : "mapbox://styles/mapbox/dark-v11"
        }
      />
    </motion.div>
  );
}
