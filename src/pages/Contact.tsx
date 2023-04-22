import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button
} from '@vechaiui/react';
import { HTMLProps, ReactNode, useState } from 'react';
import useStore from '@src/store';
import { Document, Page } from 'react-pdf/dist/esm/entry.vite';
import { debounce } from 'lodash';
import { isWideListener, pageRef } from '../etc/helper';

export default function Contact(props: HTMLProps<HTMLDivElement>) {
  const { imageBuilder, contact, resume } = useStore();
  const ref = pageRef().containerCallback;
  const [scale, setScale] = useState(1.0);

  const isWide = isWideListener();

  const Label = (props: { children: ReactNode }) => {
    return (
      <FormLabel className="mainText py-1.5">
        {props.children}
      </FormLabel>
    );
  };

  const TextInput = (props: { placeholder: string }) => {
    return (
      <Input
        placeholder={props.placeholder}
        className="border-foreground bg-fill/10 w-full rounded-md border-2"
      />
    );
  };

  const TextArea = (props: { placeholder: string }) => {
    return (
      <Textarea
        placeholder={props.placeholder}
        className="border-foreground bg-fill/10 w-full flex-1 rounded-md border-2"
      />
    );
  };

  const onPageLoad = debounce((page) => {
    const parentDiv = document.querySelector('#pdfDocument');
    if (parentDiv) {
      const pageScale = Math.min(
        parentDiv.clientWidth / page.originalWidth,
        parentDiv.clientHeight / page.originalHeight
      );
      if (scale !== pageScale) {
        setScale(pageScale);
      }
    }
  }, 100);

  return (
    <div id={'contact'} className="sticky top-[10%] h-screen xl:top-[15%]" {...props} ref={ref}>
      <div className="bg-base/10 sticky top-[10%] flex h-[70vh] w-full flex-col gap-5 xl:top-[15%] xl:px-4">
        <h1 className="title relative left-0 flex w-full items-center gap-10">
          Contact
          <div className="bg-foreground h-[2px] w-1/3" />
        </h1>
        <div className="flex h-full w-full flex-col xl:flex-row xl:gap-8 xl:px-8">
          <div className="flex flex-col xl:w-3/5">
            <h2 className="mainText">
              Interested in working together? Just drop me a message here.
            </h2>
            <FormControl id="name" className="my-1 flex flex-col">
              {isWide && <Label>Name</Label>}
              <TextInput placeholder={isWide ? "" : "Name"} />
            </FormControl>
            <FormControl id="email" className="my-1 flex flex-col">
              {isWide && <Label>Email</Label>}
              <TextInput placeholder={isWide ? "" : "Email"} />
            </FormControl>
            <FormControl id="message" className="my-1 flex h-40 flex-col">
              {isWide && <Label>Message</Label>}
              <TextArea placeholder={isWide ? "" : "Message"} />
            </FormControl>

            <Button className="border-foreground hover:bg-fill/30 my-2 rounded-md border-2 p-3 xl:my-4">
              SEND
            </Button>
            <h4 className="mainText p-2 text-xs">
              Actually, its probably more convienient to just email me. ¯\_(ツ)_/¯
            </h4>
            {(contact && imageBuilder) && contact.map((info) => {
              const svgUrl = imageBuilder.image(info.thumbnail).url();
              return (
                <div
                  key={info.value}
                  className="mainText flex w-full items-center gap-4 py-1 align-middle"
                >
                  <svg
                    className="icon h-10 w-10"
                    data-src={svgUrl}
                    {...{ fill: 'currentColor' }}
                  />
                  {info.value}
                </div>
              );
            })}
          </div>
          <div className="flex h-full flex-col items-center justify-center xl:w-2/5">
            {(isWideListener() && resume) && <div
              className="flex max-h-[66%] max-w-full text-clip"
              id="pdfDocument"
            >
              <Document className="" file={resume.url}>
                <Page
                  pageNumber={1}
                  renderTextLayer={false}
                  onLoadSuccess={onPageLoad}
                  scale={scale}
                  renderAnnotationLayer={false}
                  key={`${scale}`}
                />
              </Document>
            </div>}
            <Button className="border-foreground hover:bg-fill/30 rounded-md border-2 p-3 xl:m-8 xl:w-1/2">
              RESUME
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
