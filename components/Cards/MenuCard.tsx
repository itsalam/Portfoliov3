"use client";

import { GridContext } from "@/lib/providers/clientState";
import { m } from "framer-motion";
import {
  Briefcase,
  FlaskRound,
  Home,
  LucideIcon,
  Moon,
  Sun,
  Users,
} from "lucide-react";
import { useContext } from "react";

import { useTheme } from "next-themes";
import { CARD_MENU_GROUP } from "../Grid/consts";
import { Dock, DockItem } from "../motion/Dock";

const MoonIcon = m(Moon);
const SunIcon = m(Sun);

const MENU_CARD_ICONS: Record<keyof typeof CARD_MENU_GROUP, LucideIcon> = {
  home: Home,
  projects: FlaskRound,
  experience: Briefcase,
  info: Users,
};

export default function Menu() {
  const { themes, resolvedTheme, setTheme } = useTheme();
  const store = useContext(GridContext)!;
  const { pushElements, activeCard } = store.getState();

  const DOCK_ITEMS = Object.entries(MENU_CARD_ICONS).map(([title, Icon]) => {
    return {
      title,
      Icon: m(Icon),
      onClick: () => pushElements(CARD_MENU_GROUP[title]),
    };
  });

  const toggleThemeIcon: DockItem = {
    onClick: () => {
      console.log("???");
      setTheme(
        themes[themes.findIndex((theme) => theme === resolvedTheme) ^ 1]
      );
    },
    Icon: resolvedTheme === themes[0] ? MoonIcon : SunIcon,
    title: "toggle theme",
    motionProps: {
      id: resolvedTheme === themes[0] ? "MoonIcon" : "SunIcon",
      initial: { rotate: 25, y: -5, opacity: 0.5 },
      animate: { rotate: 0, y: 0, opacity: 1 },
      exit: { rotate: 25, y: -5, opacity: 0.5 },
      transition: { duration: 0.2 },
    },
  };

  const activeItem = activeCard
    ? Object.entries(CARD_MENU_GROUP).findIndex(([, cards]) =>
        cards.includes(activeCard))
    : undefined;

  return (
    <Dock
      activeItem={activeItem ?? undefined}
      items={[...DOCK_ITEMS, toggleThemeIcon]}
      desktopClassName="fixed z-50 w-fit"
      mobileClassName="fixed z-50 right-[12px]"
    />
  );
}
