import { isWideListener } from "@src/etc/Helpers";
import { Social } from "@src/store/types";
import { cx } from "@vechaiui/react";
import useStore from '@src/store';
import DownloadButton from "./DownloadButton";
import { useCallback } from "react";

const Social = (props: { info: Social, svgSrc: string }) => {
    const contents = (
        <>
            {<svg
                className="icon h-8 w-8 p-1 md:h-8 md:w-8"
                data-src={props.svgSrc}
                {...{ fill: 'currentColor' }}
            />}
            {props.info.value}
        </>
    );

    return (
        <a
            key={props.info.value}
            href={props.info.link}
            className={cx(
                'subText flex w-full items-center gap-1 py-0 align-middle',
                { 'underline cursor-pointer': props.info.link !== undefined },
                'hover:brightness-125 transition-all '
            )}
        >
            {contents}
        </a>
    );
};

const SocialInfo = () => {
    const { getSrc, contacts, resume } = useStore.getState();

    const isWide = isWideListener();

    const socials = useCallback(() => contacts &&
        contacts.map((contact) => (
            <Social
                {...{ info: contact, svgSrc: getSrc ? getSrc(contact.thumbnail) : "" }}
                key={contact.value}
            />
        )), []);

    return <div className="flex h-full justify-between gap-1 sm:pt-4 md:pt-2">
        <div className="tall:pt-4 md:pr-12 md:pt-0">
            <h4 className="mainText px-1 text-xs">
                Actually, its probably more convienient to just use my socials.
                ¯\_(ツ)_/¯
            </h4>
            {socials()}
        </div>
        {!isWide && resume && (
            <DownloadButton
                resume={resume}
                className="mx-4 h-40 w-2/5 self-center"
                svgSrc={getSrc ? getSrc(resume.icon) : ""}
            />
        )}
    </div>
}


export default SocialInfo;