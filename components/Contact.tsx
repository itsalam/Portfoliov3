"use client";

import Link from "@/components/Link";
import { CMSContext } from "@/lib/providers/state";
import { cn } from "@/lib/utils";
import React, { ComponentPropsWithoutRef, useContext } from "react";
import { useStore } from "zustand";

const ContactOverlay: React.FC = (props: ComponentPropsWithoutRef<"div">) => {
  const { className, ...rest } = props;
  const cms = useContext(CMSContext)!;
  const contacts = useStore(cms, (cms) => cms.contact);

  return (
    <div
      className={cn(
        "glass md:flex",
        "absolute bottom-g-1/8 left-g-1/8 z-50", // basicStyles, positioning, layoutControl
        "hidden items-center justify-center gap-2 rounded-lg", // sizing, layout, border
        "dark:bg-[--black-a10] bg-[--white-a10] p-2", // background, padding
        "text-[--accent-12]", // textStyles
        className
      )}
      {...rest}
    >
      {contacts &&
        contacts.map(({ name, link }) => (
          <Link key={name} text={name} value={link} />
        ))}
    </div>
  );
};

export default ContactOverlay;
