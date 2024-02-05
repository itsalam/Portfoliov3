"use client";

import { Separator, Text } from "@radix-ui/themes";
import { motion } from "framer-motion";
import React from "react";
import Vertex from "./Backdrop/Vertex";
import Clock from "./util/Clock";

const Overlay: React.FC = () => {
  const currentDate = new Date().toLocaleDateString("en-GB");

  const NavLi = (props: { title: string; prefix: string }) => (
    <motion.li className="dark:text-[--sage-4]  transition-colors hover:dark:text-[--sage-11] cursor-pointer font-favorit">
      <Text size={{ xl: "3", md: "2" }}>
        <Text
          size={{ xl: "2", md: "1" }}
          className="font-favorit dark:text-[--sage-7]"
        >
          {props.prefix}
        </Text>{" "}
        {props.title}
      </Text>
    </motion.li>
  );

  return (
    <nav className="w-0 h-0 fixed top-g-y-0.5 z-50">
      <div className="relative p-4 3xl:w-g-x-4 3xl:left-g-x-4 h-g-y-1 w-g-x-6 left-g-x-3">
        <div className="flex relative flex-row items-center justify-between glass bg-[--gray-a9] p-4 px-8 w-auto">
          <Text
            size={{ xl: "6", md: "3" }}
            className="dark:text-[--sage-4] text-black font-favorit relative"
          >
            <div>Vincent</div>
            <div className="relative">Lam</div>
          </Text>

          <ul className="relative flex space-x-4 gap-2 items-center">
            <svg
              className="w-5 h-5 absolute bottom-0 right-0 translate-y-full"
              viewBox="0 0 10 10"
            >
              <Vertex position={[5, 5]} size={6} thickness={0.75} />
            </svg>
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
      <div className="absolute 3xl:top-0 top-g-y-0.5 left-g-x-10 3xl:left-g-x-11 font-favorit 3xl:w-g-x-0.5 w-g-x-1">
        <Text className="w-full text-right block" size={{ xl: "5", md: "2" }}>
          {currentDate}
        </Text>
        <Text className="w-full text-right block" size={{ xl: "5", md: "2" }}>
          <Clock />
        </Text>
      </div>
      <div className="w-48 h-12 rounded-full absolute left-g-x-11 pb-g-x-1 top-g-y-7 -translate-y-1/2 -translate-x-1/2 rotate-90 flex items-center justify-center">
        <Text
          className="font-favorit whitespace-nowrap"
          size={{ xl: "5", md: "2" }}
        >
          Scroll Down
        </Text>
        <svg
          className="h-4 w-12"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="0" y1="12" x2="48" y2="12" />
          <line x1="36" y1="5" x2="48" y2="12" />
        </svg>
      </div>
    </nav>
  );
};

export default Overlay;
