"use client";

import { motion } from "framer-motion";
import { Separator, Text } from "@radix-ui/themes";
import React from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./base-ui/navigation-menu";
import Clock from "./util/Clock";

const NavBar: React.FC = () => {
  const currentDate = new Date().toLocaleDateString("en-GB");

  const NavLi = (props: { title: string; prefix: string }) => (
    <motion.li className="dark:text-[--sage-4]  transition-colors hover:dark:text-[--sage-11] cursor-pointer font-favorit text-xs">
      <Text size={"3"}>
        <Text size={"2"} className="font-favorit dark:text-[--sage-7]">
          {props.prefix}
        </Text>{" "}
        {props.title}
      </Text>
    </motion.li>
  );

  return (
    <nav className="w-full fixed h-g-y-1 top-g-y-1/2 z-50">
      <div className="relative p-6 w-g-x-4 left-g-x-4 h-g-y-1">
        <div className="flex relative flex-row items-center justify-between glass bg-[--gray-a9] p-6 px-8 w-auto">
          <Text
            size={"6"}
            className="dark:text-[--sage-4] text-black font-favorit relative"
          >
            <div>Vincent</div>
            <div className="relative">
              Lam
              <svg
                className="w-8 h-8 absolute bottom-0 right-0"
                viewBox="0 0 10 10"
              >
                <line
                  x1="1"
                  y1="8"
                  x2="5"
                  y2="2"
                  stroke="var(--sage-7)"
                  strokeWidth=".5"
                />
                <line
                  x1="2"
                  y1="8"
                  x2="6"
                  y2="2"
                  stroke="var(--sage-7)"
                  strokeWidth=".5"
                />
              </svg>
            </div>
          </Text>
          <ul className="flex space-x-4 gap-2 items-center">
            <NavLi prefix="01." title="HOME" />
            <Separator
              orientation="horizontal"
              className="dark:bg-[--sage-7]"
            />
            <NavLi prefix="02." title="ABOUT" />
            <Separator
              orientation="horizontal"
              className="dark:bg-[--sage-7]"
            />
            <NavLi prefix="03." title="PROJECTS" />
            <Separator
              orientation="horizontal"
              className="dark:bg-[--sage-7]"
            />
            <NavLi prefix="04." title="CONTACT" />
          </ul>
        </div>
      </div>
      <div className="absolute top-0 ml-g-x-11 font-favorit w-g-x-1/2">
        <Text className="w-full text-right block" size={"5"}>
          {currentDate}
        </Text>
        <Text className="w-full text-right block" size={"5"}>
          <Clock />
        </Text>
      </div>
      <div className="w-16 h-16 rounded-full bg-black absolute left-g-x-11 top-g-y-4 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center">
        <Text className="font-favorit" size={"5"}>
          1/3
        </Text>
      </div>
    </nav>
  );
};

export default NavBar;
