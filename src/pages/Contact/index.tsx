import { AspectRatio, Container } from '@mantine/core';
import { Title } from '@src/components/Commons';
import { isWideListener } from '@src/etc/Helpers';
import useStore from '@src/store';
import { Resume } from '@src/store/types';
import { useCallback } from 'react';
import ContactForm from './components/ContactForm';
import SocialInfo from './components/SocialInfo';

export default function Contact() {
  const { getSrc, resume } = useStore.getState();
  const isWide = isWideListener();

  const ResumeSideColumn = useCallback(
    (props: { resume: Resume }) => (
      <div className="flex h-[80vh] w-1/3 flex-col items-center justify-center gap-4 self-center ">
        <AspectRatio ratio={1 / 1.414} className="h-full max-h-[680px] w-full max-w-[490px]">
          <object
            type="application/pdf"
            data={props.resume.url}
          />
        </AspectRatio>
      </div>

    ),
    []
  );

  return (
    <div
      id="contact"
      className="flex items-start justify-center sm:h-full sm:p-16 md:items-center"
    >
      <div className="flex h-auto w-full gap-10 xl:px-4">
        <div className="flex h-full flex-col gap-2 py-16">
          <Title>Contact</Title>
          <Container className="ml-0 flex h-full w-full flex-1 flex-col gap-2">
            <ContactForm />
            <SocialInfo />
          </Container>
        </div>
        {isWide && resume && <ResumeSideColumn resume={resume} />}
      </div>
    </div>
  );
}
