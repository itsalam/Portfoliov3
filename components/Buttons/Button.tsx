import { cn } from "@/lib/utils";
import { m } from "framer-motion";
import { ComponentPropsWithoutRef, forwardRef } from "react";

export const Button = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof m.button>
>(({ className, onClick, disabled, ...props }, ref) => {
  return (
    <m.button
      ref={ref}
      data-button="true"
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 1.05, y: -6 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      style={{
        aspectRatio: "1 / 1",
      }}
      className={cn(
        "border-[1px]",
        "z-50 flex aspect-square w-5", // layoutControl, sizing
        "items-center justify-center rounded-full border-current", // layout, border
        "disabled:text-[--gray-9] hover:text-[--accent-8]", // textStyles
        "transition-all", // transitionsAnimations
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";