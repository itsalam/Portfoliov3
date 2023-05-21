import { Resume } from "@src/store/types";
import { cx } from "@vechaiui/react";
import { HTMLProps } from "react";

const DownloadButton = (
    props: HTMLProps<HTMLButtonElement> & { resume: Resume, svgSrc: string }
) =>
    <a
        href={props.resume.url}
        download={props.resume.title}
        className={cx(
            'bg-primary-400/10 hover:bg-foreground group-hover:text-background group relative flex flex-col items-center justify-center overflow-hidden rounded px-4 py-3 font-semibold transition-all',
            props.className
        )}
    >
        <span className="bg-foreground absolute bottom-0 left-0 h-1 w-full transition-all duration-150 ease-in-out group-hover:h-full" />

        <span className=" group-hover:text-background absolute flex h-full flex-col items-center justify-center">
            <svg
                className="icon group-hover:text-background h-10 w-10"
                data-src={props.svgSrc}
                {...{ fill: 'currentColor' }}
            />
            Resume
        </span>
    </a>;

export default DownloadButton;