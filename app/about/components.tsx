import { AnimateText } from "@/components/TextEffects";
import { animateTransition } from "@/lib/clientUtils";
import { cn } from "@/lib/utils";
import { FC } from "react";

export const ProjectTitle = (props: { className?: string; title: string }) => {
  const { className, title } = props;
  const Title: FC<{ className: string }> = ({ className }) => (
    <AnimateText
      size={"7"}
      className={cn("font-bold", className)}
      text={title}
      variants={animateTransition}
    />
  );

  return (
    <>
      <Title className={cn("mix-blend-color-dodge", className)} />
      <Title className="absolute blur-sm mix-blend-lighten text-[--gray-4]" />
    </>
  );
};
