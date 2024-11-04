import { useBreakpoints } from "@/lib/providers/breakpoint";
import { cn } from "@/lib/utils";
import { m } from "framer-motion";
import { ComponentPropsWithoutRef, forwardRef } from "react";

export const Button = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<typeof m.button>
>(({ className, onClick, disabled, ...props }, ref) => {
  const breakpoint = useBreakpoints();
  const isSmall = breakpoint === "xs" || breakpoint === "sm";

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
        "z-50 flex aspect-square", // layoutControl, sizing
        "items-center justify-center rounded-full border-current", // layout, border
        "disabled:text-[--gray-9] hover:text-[--accent-8]", // textStyles
        "transition-all", // transitionsAnimations
        isSmall ? "w-3" : "w-5",
        className
      )}
      {...props}
    />
  );
});
Button.displayName = "Button";
