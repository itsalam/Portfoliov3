import {
  useNotification,
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
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { pageRef, isWideListener, ArrowSVG } from '@src/etc/Helpers';

export default function Contact(props: HTMLProps<HTMLDivElement>) {
  const { imageBuilder, contact, resume } = useStore();
  const ref = pageRef().containerCallback;
  const [scale, setScale] = useState(1.0);
  const notification = useNotification()

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
  }, 1000);

  const svgUrl = (imageRec: SanityImageSource) => imageBuilder?.image(imageRec).url() ?? "";

  const ContactInfo = (props: { info: { value: string }, svgUrl: string }) => <div
    key={props.info.value}
    className="mainText flex w-full items-center gap-2 py-1 align-middle"
  >
    <svg
      className="icon h-8 w-8 md:h-10 md:w-10"
      data-src={props.svgUrl}
      {...{ fill: 'currentColor' }}
    />
    {props.info.value}
  </div>

  return (
    <div id={'contact'} className="sticky h-screen py-[10vh] " {...props} ref={ref}>
      <div className="bg-base/10 sticky top-[10%] flex h-auto w-full flex-col gap-2 xl:px-4">
        <h1 className="title relative left-0 flex w-full items-center gap-10">
          Contact
          <div className="bg-foreground h-[2px] w-1/3" />
        </h1>

        <div className="flex h-full w-full flex-col gap-2 xl:flex-row xl:gap-8 xl:px-8">
          <div className="flex flex-col gap-3 xl:w-3/5">
            <h2 className="mainText">
              Interested in working together? Just drop me a message here.
            </h2>
            <FormControl id="name" className="flex flex-col">
              {isWide && <Label>Name</Label>}
              <TextInput placeholder={isWide ? "" : "Name"} />
            </FormControl>
            <FormControl id="email" className="flex flex-col">
              {isWide && <Label>Email</Label>}
              <TextInput placeholder={isWide ? "" : "Email"} />
            </FormControl>
            <FormControl id="message" className="flex h-40 flex-col">
              {isWide && <Label>Message</Label>}
              <TextArea placeholder={isWide ? "" : "Message"} />
            </FormControl>

            <Button
              onClick={() => notification({ title: "Message sent!", status: "success" })}
              className="bg-primary-400/20 text-foreground group relative inline-flex w-56 overflow-hidden rounded py-3 pl-4 pr-12 font-semibold transition-all duration-150 ease-in-out hover:pl-10 hover:pr-6">
              <span className="bg-foreground absolute bottom-0 left-0 h-1 w-full transition-all duration-150 ease-in-out group-hover:h-full"></span>
              <span className="absolute right-0 pr-4 duration-200 ease-out group-hover:translate-x-12">
                <ArrowSVG className="text-foreground h-5 w-5" />
              </span>
              <span className="absolute left-0 -translate-x-12 pl-2.5 duration-200 ease-out group-hover:translate-x-0">
                <ArrowSVG className="text-background h-5 w-5" />
              </span>
              <span className="group-hover:text-background relative w-full text-left transition-colors duration-200 ease-in-out">Send message</span>
            </Button>

            <div className="flex justify-evenly gap-2 md:pt-10">
              <div>
                <h4 className="mainText p-2 text-xs">
                  Actually, its probably more convienient to just email me. ¯\_(ツ)_/¯
                </h4>
                {(contact && imageBuilder) && contact.map((info) => <ContactInfo {...{ info, svgUrl: svgUrl(info.thumbnail) }} />
                )}
              </div>
              {(!isWide && resume) && <Button className="bg-primary-400/10 hover:bg-foreground hover:text-background group relative flex w-1/4 flex-col items-center justify-center overflow-hidden rounded px-4 py-3 font-semibold transition-all">
                <span className="bg-foreground absolute bottom-0 left-0 h-1 w-full transition-all duration-150 ease-in-out group-hover:h-full" />
                <svg
                  className="icon group-hover:text-background absolute top-8 h-10 w-10"
                  data-src={svgUrl(resume.icon)}
                  {...{ fill: 'currentColor' }}
                />
                <span className="group-hover:text-background absolute bottom-8">Resume</span>
              </Button>
              }
            </div>

          </div>
          {(isWide && resume) && <div className="flex h-full flex-col items-center justify-center gap-4 xl:w-2/5">
            <div
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
            </div>
            <Button className="bg-primary-400/10 hover:bg-foreground group-hover:text-background group relative flex h-20 w-1/2 flex-col items-center justify-center overflow-hidden rounded px-4 py-3 font-semibold transition-all">
              <span className="bg-foreground absolute bottom-0 left-0 h-1 w-full transition-all duration-150 ease-in-out group-hover:h-full" />
              <svg
                className="icon group-hover:text-background absolute top-3 h-10 w-10"
                data-src={svgUrl(resume.icon)}
                {...{ fill: 'currentColor' }}
              />
              <span className="group-hover:text-background absolute bottom-3">Resume</span>
            </Button>
          </div>
          }
        </div>
      </div>
    </div >
  );
}
