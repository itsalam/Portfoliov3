"use client";

import { maskScrollArea } from "@/lib/clientUtils";
import { ScrollArea as BaseScrollArea } from "@radix-ui/themes";
import { ComponentProps, UIEvent, useEffect, useRef } from "react";

export default function ScrollArea(
  props: ComponentProps<typeof BaseScrollArea>
) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: UIEvent) => {
    const h = e.target as HTMLElement;
    const st = h.scrollTop || document.body.scrollTop;
    const sh = h.scrollHeight || document.body.scrollHeight;
    const percent = st / (sh - h.clientHeight);
    maskScrollArea("bottom", containerRef.current as HTMLElement, percent, 10);
  };

  useEffect(() => {
    maskScrollArea("bottom", containerRef.current as HTMLElement, 0, 10);
  });

  return (
    <BaseScrollArea onScroll={handleScroll} ref={containerRef} {...props} />
  );
}
