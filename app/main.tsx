"use client";

import Menu from "@/components/Cards/MenuCard";
import { CARD_TYPES } from "@/components/Cards/types";
import ContactOverlay from "@/components/Contact";
import Grid from "@/components/Grid/Grid";
import OverlayInfo from "@/components/Overlay";
import { GridContext } from "@/lib/providers/clientState";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import { useStore } from "zustand";

export default function Main() {
  const router = useRouter();
  const store = useContext(GridContext)!;
  const { activeCard } = useStore(store);
  const baseName = usePathname().split("/")[1];
  useEffect(() => {
    if (baseName !== (activeCard ?? "")) {
      router.replace("/" + activeCard?.toLocaleLowerCase());
    }

    // TODO: sometimes doesnt work?
    const themeElement = document.getElementById("theme");
    if (themeElement) {
      if (activeCard) {
        if (activeCard !== CARD_TYPES.Home) {
          themeElement.classList.add("focus");
        }
        themeElement.classList.add("no-shadow");
      } else {
        themeElement.classList.remove("focus");
        themeElement.classList.remove("no-shadow");
      }
    }
  }, [activeCard, baseName, router]);

  return (
    <>
      <Grid />
      <Menu />
      <OverlayInfo />
      <ContactOverlay />
    </>
  );
}
