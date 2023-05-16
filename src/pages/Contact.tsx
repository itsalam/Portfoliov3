import {
  useNotification,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  cx
} from '@vechaiui/react';
import { HTMLProps, ReactNode, forwardRef } from 'react';
import useStore from '@src/store';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { isWideListener, ArrowSVG } from '@src/etc/Helpers';
import { useForm } from 'react-hook-form';
import { Resume, Social } from '@src/store/types';
import { Title } from '@src/components/Commons';

type FormInputProps = {
  id: string;
  required?: boolean;
  text?: boolean;
  invalid: boolean;
};

export default function Contact(props: HTMLProps<HTMLDivElement>) {
  const { imageBuilder, contact: contacts, resume } = useStore();
  const notification = useNotification();

  const {
    register,
    formState: { errors },
    handleSubmit
  } = useForm();

  const isWide = isWideListener();

  const Label = (props: { children: ReactNode }) => {
    return (
      <FormLabel className="mainText capitalize">{props.children}</FormLabel>
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

  const svgUrl = (imageRec: SanityImageSource) =>
    imageBuilder?.image(imageRec).url() ?? '';

  const submitContact = async (data: RequestInit | undefined) => {
    fetch('/sendContactMail', {
      method: 'POST',
      body: JSON.stringify(data)
    })
      .then((res: Response) => {
        console.log(res);
        notification({ title: 'Message sent!', status: 'success' });
      })
      .catch((e) => {
        console.log(e);
        notification({
          title: 'Oh no, somethings wrong and you should tell me around it. o:',
          status: 'warning'
        });
      });
  };

  const DownloadButton = (
    props: HTMLProps<HTMLButtonElement> & { resume: Resume }
  ) => (
    <a
      href={props.resume.url}
      download={props.resume.title}
      className={cx(
        'bg-primary-400/10 hover:bg-foreground group-hover:text-background group relative flex flex-col items-center justify-center overflow-hidden rounded px-4 py-3 font-semibold transition-all',
        props.className
      )}
    >
      <span className="bg-foreground absolute bottom-0 left-0 h-1 w-full transition-all duration-150 ease-in-out group-hover:h-full" />
      <svg
        className="icon group-hover:text-background absolute inset-y-12 h-10 w-10 md:inset-y-3"
        data-src={svgUrl(props.resume.icon)}
        {...{ fill: 'currentColor' }}
      />
      <span className="group-hover:text-background absolute inset-y-20 md:inset-y-10">
        Resume
      </span>
    </a>
  );

  const SocialInfo = (props: {
    info: Social;
    svgSrc: SanityImageSource;
  }) => (
    <div
      key={props.info.value}
      className="subText flex w-full items-center gap-1 py-1 align-middle md:py-0"
    >
      <svg
        className="icon h-8 w-8 p-1 md:h-8 md:w-8"
        data-src={svgUrl(props.svgSrc)}
        {...{ fill: 'currentColor' }}
      />
      {
        props.info.link ?
          <a className='underline' href={props.info.link}>{props.info.value}</a> :
          props.info.value}
    </div>
  );

  const ResumePreview = (props: { resume: Resume }) => {
    return (
      <div className="h-full w-full">
        <embed
          src={props.resume.url}
          className="h-[65vh] min-h-[300px]  w-full xl:h-[50vh]"
        />
      </div>
    );
  };

  const FormSubmitButton = () => (
    <Button
      type="submit"
      className="bg-primary-400/20 text-foreground group relative mt-2 inline-flex w-56 overflow-hidden rounded py-3 pl-4 pr-12 font-semibold transition-all duration-150 ease-in-out hover:pl-10 hover:pr-6"
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
  );

  const ContactForm = () => (
    <form
      className="flex h-full flex-1 flex-col gap-3 md:gap-4"
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
      <FormSubmitButton />
    </form>
  );

  const Socials = () => (
    <div className="flex h-full justify-between gap-1 sm:pt-4 md:pt-8">
      <div className="md:pr-12">
        <h4 className="mainText px-1 text-xs">
          Actually, its probably more convienient to just use my socials. ¯\_(ツ)_/¯
        </h4>
        {contacts &&
          imageBuilder &&
          contacts.map((contact) => (
            <SocialInfo
              {...{ info: contact, svgSrc: contact.thumbnail }}
              key={contact.value}
            />
          ))}
      </div>
      {!isWide && resume && (
        <DownloadButton resume={resume} className="mx-4 h-40 w-2/5 self-center" />
      )}
    </div>
  );

  const ResumeSideColumn = (props: { resume: Resume }) => (
    <div className="flex h-full flex-col items-center justify-center gap-4 self-center xl:w-2/5">
      <ResumePreview resume={props.resume} />
      <DownloadButton resume={props.resume} className="h-20 w-1/3" />
    </div>
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
          <Socials />
        </div>
        {isWide && resume && <ResumeSideColumn resume={resume} />}
      </div>
    </div>
  );
}
