import {
  useNotification,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button
} from '@vechaiui/react';
import { HTMLProps, ReactNode, forwardRef, useState } from 'react';
import useStore from '@src/store';
import { Document, Page } from 'react-pdf/dist/esm/entry.vite';
import { debounce } from 'lodash';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { pageRef, isWideListener, ArrowSVG } from '@src/etc/Helpers';
import { useForm } from 'react-hook-form';

type FormInputProps = {
  id: string;
  required?: boolean;
  text?: boolean;
  invalid: boolean;
};

export default function Contact(props: HTMLProps<HTMLDivElement>) {
  const { imageBuilder, contact, resume } = useStore();
  const ref = pageRef().containerCallback;
  const [scale, setScale] = useState(1.0);
  const notification = useNotification();

  const {
    register,
    formState: { errors },
    handleSubmit
  } = useForm();

  const isWide = isWideListener();

  const Label = (props: { children: ReactNode }) => {
    return (
      <FormLabel className="mainText py-1.5 capitalize">
        {props.children}
      </FormLabel>
    );
  };

  const TextInput = forwardRef<
    HTMLTextAreaElement,
    { placeholder: string } & object
  >((props, ref) => (
    <Input
      {...props}
      ref={ref}
      className="border-foreground bg-fill/10 w-full rounded-md border-2 "
    />
  ));

  const TextArea = forwardRef<
    HTMLTextAreaElement,
    { placeholder: string } & object
  >((props, ref) => (
    <Textarea
      {...props}
      ref={ref}
      className="border-foreground bg-fill/10 w-full flex-1 rounded-md border-2 "
    />
  ));

  const FormInput = forwardRef<
    HTMLDivElement,
    HTMLProps<HTMLFormElement> & FormInputProps
  >((props, ref) => (
    <FormControl
      id={props.id}
      className={'flex flex-col ' + props.className}
      invalid={props.invalid}
      ref={ref}
    >
      {isWide && <Label>{props.id}</Label>}
      {props.text ? (
        <TextArea
          placeholder={isWide ? '' : props.id}
          {...register(props.id, { required: props.required })}
        />
      ) : (
        <TextInput
          placeholder={isWide ? '' : props.id}
          {...register(props.id, { required: props.required })}
        />
      )}
    </FormControl>
  ));

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

  const svgUrl = (imageRec: SanityImageSource) =>
    imageBuilder?.image(imageRec).url() ?? '';

  const submitContact = async (data: RequestInit | undefined) => {
    fetch(
      'https://us-central1-portfolio-282821.cloudfunctions.net/sendContactMail',
      data
    )
      .then((res: Response) => {
        console.log(res);
        notification({ title: 'Message sent!', status: 'success' });
      })
      .catch((e) => {
        notification({
          title: 'Oh no, somethings wrong and you should tell me around it. o:',
          status: 'warning'
        });
      });
  };

  const ContactInfo = (props: {
    info: { value: string };
    svgSrc: SanityImageSource;
  }) => (
    <div
      key={props.info.value}
      className="mainText flex w-full items-center gap-2 py-1 align-middle"
    >
      <svg
        className="icon h-8 w-8 md:h-10 md:w-10"
        data-src={svgUrl(props.svgSrc)}
        {...{ fill: 'currentColor' }}
      />
      {props.info.value}
    </div>
  );

  return (
    <div
      id={'contact'}
      className="flex h-screen items-center justify-center py-[10vh]"
      {...props}
      ref={ref}
    >
      <div className="bg-base/10 flex h-auto w-full flex-col  gap-2 xl:px-4">
        <h1 className="title relative left-0 flex w-full items-center gap-10">
          Contact
          <div className="bg-foreground h-[2px] w-1/3" />
        </h1>

        <div className="flex h-full w-full flex-col gap-2 xl:flex-row xl:gap-8 xl:px-8">
          <form
            className="flex flex-col gap-3 xl:w-3/5"
            onSubmit={handleSubmit(submitContact)}
          >
            <h2 className="mainText">
              Interested in working together? Just drop me a message here.
            </h2>
            <FormInput id="name" required invalid={Boolean(errors.name)} />
            <FormInput id="email" required invalid={Boolean(errors.email)} />
            <FormInput
              id="message"
              required
              text
              className="h-40"
              invalid={Boolean(errors.message)}
            />
            <Button
              type="submit"
              className="bg-primary-400/20 text-foreground group relative inline-flex w-56 overflow-hidden rounded py-3 pl-4 pr-12 font-semibold transition-all duration-150 ease-in-out hover:pl-10 hover:pr-6"
            >
              <span className="bg-foreground absolute bottom-0 left-0 h-1 w-full transition-all duration-150 ease-in-out group-hover:h-full"></span>
              <span className="absolute right-0 pr-4 duration-200 ease-out group-hover:translate-x-12">
                <ArrowSVG className="text-foreground h-5 w-5" />
              </span>
              <span className="absolute left-0 -translate-x-12 pl-2.5 duration-200 ease-out group-hover:translate-x-0">
                <ArrowSVG className="text-background h-5 w-5" />
              </span>
              <span className="group-hover:text-background relative w-full text-left transition-colors duration-200 ease-in-out">
                Send message
              </span>
            </Button>

            <div className="flex justify-evenly gap-2 pt-4 md:pt-0">
              <div>
                <h4 className="mainText p-2 text-xs">
                  Actually, its probably more convienient to just email me.
                  ¯\_(ツ)_/¯
                </h4>
                {contact &&
                  imageBuilder &&
                  contact.map((info) => (
                    <ContactInfo {...{ info, svgSrc: info.thumbnail }} />
                  ))}
              </div>
              {!isWide && resume && (
                <button className="bg-primary-400/10 hover:bg-foreground hover:text-background group relative flex w-1/4 flex-col items-center justify-center overflow-hidden rounded px-4 py-3 font-semibold transition-all">
                  <span className="bg-foreground absolute bottom-0 left-0 h-1 w-full transition-all duration-150 ease-in-out group-hover:h-full" />
                  <svg
                    className="icon group-hover:text-background absolute top-8 h-10 w-10"
                    data-src={svgUrl(resume.icon)}
                    {...{ fill: 'currentColor' }}
                  />
                  <span className="group-hover:text-background absolute bottom-8">
                    Resume
                  </span>
                </button>
              )}
            </div>
          </form>
          {isWide && resume && (
            <div className="flex h-full flex-col items-center justify-center gap-4 xl:w-2/5">
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
                <span className="group-hover:text-background absolute bottom-3">
                  Resume
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
