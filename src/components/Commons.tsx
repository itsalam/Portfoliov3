import { HTMLProps } from "react";

export const Title = (props: HTMLProps<HTMLHeadElement>) =>
    <h1 className="title relative left-0 flex w-full items-center gap-4">
        {props.children}
        <div className="bg-foreground relative top-1/4 h-[2px] w-1/3" />
    </h1>