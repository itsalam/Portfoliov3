import { HTMLProps, useCallback } from 'react';
import useStore from '@src/store';
import { isWideListener } from '@src/etc/Helpers';
import { Resume } from '@src/store/types';
import { Title } from '@src/components/Commons';
import DownloadButton from './components/DownloadButton';
import ContactForm from './components/ContactForm';
import SocialInfo from './components/SocialInfo';

export default function Contact(props: HTMLProps<HTMLDivElement>) {
  const { getSrc, resume } = useStore.getState();

  const isWide = isWideListener();

  const ResumeSideColumn = useCallback(
    (props: { resume: Resume }) => (
      <div className="flex h-full w-1/2 flex-col items-center justify-center gap-4 self-center ">
        <div className="h-full w-full">
          <embed
            src={props.resume.url}
            className="h-[65vh] min-h-[300px]  w-full xl:h-[70vh]"
          />
        </div>
        <DownloadButton
          resume={props.resume}
          className="h-20 w-1/3"
          svgSrc={getSrc ? getSrc(props.resume.icon) : ""} />
      </div>
    ),
    []
  );

  return (
    <div
      id={'contact'}
      className="flex h-full items-start justify-center py-16 md:items-center md:py-[10vh]"
      {...props}
    >
      <div className="flex h-auto w-full gap-10 xl:px-4">
        <div className="flex h-full w-full flex-1 flex-col gap-2">
          <Title>Contact</Title>
          <ContactForm />
          <SocialInfo />
        </div>
        {isWide && resume && <ResumeSideColumn resume={resume} />}
      </div>
    </div>
  );
}
