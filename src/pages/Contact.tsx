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
import { isWide, pageRef } from '../etc/helper';

export default function Contact(props: HTMLProps<HTMLDivElement>) {
  const { imageBuilder, contact, resume } = useStore();
  const ref = pageRef().containerCallback;
  const [scale, setScale] = useState(1.0);

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
        className="w-full border-2 border-foreground bg-fill/10 rounded-md"
      />
    );
  };

  const TextArea = (props: { placeholder: string }) => {
    return (
      <Textarea
        placeholder={props.placeholder}
        className="w-full border-2 border-foreground bg-fill/10 flex-1 rounded-md"
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
    <div className="h-[100vh]" id={'contact'} {...props} ref={ref}>
      <div className="h-[166vh] relative mt-40">
        <div className="sticky h-[70vh] w-full bg-base/10 flex flex-col gap-5 xl:px-4 xl:top-[15%] top-[10%]">
          <h1 className="title relative left-0 w-full flex items-center gap-10">
            Contact
            <div className="h-[2px] w-1/3 bg-foreground" />
          </h1>
          <div className="w-full h-full flex xl:gap-8 xl:px-8 flex-col xl:flex-row">
            <div className="flex flex-col xl:w-3/5">
              <h2 className="mainText">
                Interested in working together? Just drop me a message here.
              </h2>
              <FormControl id="name" className="flex flex-col my-1">
                {isWide() && <Label>Name</Label>}
                <TextInput placeholder={isWide() ? "" : "Name"} />
              </FormControl>
              <FormControl id="email" className="flex flex-col my-1">
                {isWide() && <Label>Email</Label>}
                <TextInput placeholder={isWide() ? "" : "Email"} />
              </FormControl>
              <FormControl id="message" className="flex flex-col my-1 h-40">
                {isWide() && <Label>Message</Label>}
                <TextArea placeholder={isWide() ? "" : "Message"} />
              </FormControl>

              <Button className="xl:my-4 my-2 p-3 border-2 border-foreground hover:bg-fill/30 rounded-md">
                SEND
              </Button>
              <h4 className="mainText text-xs p-2">
                Actually, its probably more convienient to just email me. ¯\_(ツ)_/¯
              </h4>
              {contact.map((info) => {
                const svgUrl = imageBuilder.image(info.thumbnail).url();
                return (
                  <div
                    key={info.value}
                    className="w-full py-1 mainText flex gap-4 items-center align-middle"
                  >
                    <svg
                      className="icon w-10 h-10"
                      data-src={svgUrl}
                      {...{ fill: 'currentColor' }}
                    />
                    {info.value}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col xl:w-2/5 h-full justify-center items-center">
              {isWide() && <div
                className="flex max-h-[66%] max-w-full overflow-clip"
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
              <Button className="xl:w-1/2 xl:m-8 p-3 border-2 border-foreground hover:bg-fill/30 rounded-md">
                RESUME
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
