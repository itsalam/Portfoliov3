"use client";

import { useResizeCallBack } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { animate, m } from "framer-motion";
import { debounce } from "lodash";
import { useTheme } from "next-themes";
import { ComponentProps, useEffect, useRef } from "react";
import Map, { MapRef } from "react-map-gl";

export default function LocationCard(props: ComponentProps<typeof m.div>) {
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

  useEffect(() => {
    animate(locationRef.current, { opacity: 1 }).then(() => {
      mapRef.current
        ?.getMap()
        .setStyle(
          resolvedTheme === "light"
            ? "mapbox://styles/mapbox/light-v11"
            : "mapbox://styles/mapbox/dark-v11"
        );
    });
  }, [resolvedTheme]);

  return (
    <m.div
      className={cn(
        "relative flex h-full w-full gap-4",
        className
      )}
      ref={locationRef}
      onAnimationComplete={resizeMap}
      {...rest}
    >
      <Map
        ref={mapRef}
        onStyleData={() =>
          setTimeout(() => animate(locationRef.current, { opacity: 1 }), 2000)
        }
        onResize={() => animate(locationRef.current, { opacity: 1 })}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_KEY}
        initialViewState={{
          longitude: -123.12,
          latitude: 49.28,
          zoom: 6,
        }}
        mapStyle={
          resolvedTheme === "light"
            ? "mapbox://styles/mapbox/light-v11"
            : "mapbox://styles/mapbox/dark-v11"
        }
      />
    </m.div>
  );
}
