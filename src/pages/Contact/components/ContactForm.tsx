import { ArrowSVG, isWideListener } from '@src/etc/Helpers';
import { Button, useNotification } from '@vechaiui/react';
import { useForm } from 'react-hook-form';
import FormInput from './FormInput';

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

const ContactForm = () => {
  const notification = useNotification();

  const {
    register,
    formState: { errors },
    handleSubmit
  } = useForm();

  const isWide = isWideListener();

  const submitContact = async (data: RequestInit | undefined) => {
    fetch('/sendContactMail', {
      method: 'POST',
      body: JSON.stringify(data)
    })
      .then((res: Response) => {
        if (res.status !== 200) {
          console.error(res.statusText);
          throw new Error(res.statusText);
        } else notification({ title: 'Message sent!', status: 'success' });
      })
      .catch((e) => {
        console.error(e);
        notification({
          title:
            "Oops, guess something went wrong. 🙃 I'll check it out in a bit.",
          status: 'warning'
        });
      });
  };

  return (
    <form
      className="flex h-full flex-1 flex-col gap-2 "
      onSubmit={handleSubmit(submitContact)}
    >
      <h2 className="mainText">
        Interested in working together? Just drop me a message here.
      </h2>
      <div className="tall:flex-col tall:gap-2 flex gap-2">
        <FormInput
          register={register}
          isWide={isWide}
          id="name"
          placeholder="Name"
          required
          invalid={Boolean(errors.name)}
        />
        <FormInput
          register={register}
          isWide={isWide}
          id="email"
          placeholder="Email"
          required
          invalid={Boolean(errors.email)}
        />
      </div>

      <FormInput
        register={register}
        isWide={isWide}
        id="message"
        placeholder="Write a message here..."
        required
        text
        className="tall:h-40 h-28"
        invalid={Boolean(errors.message)}
      />
      <FormSubmitButton />
    </form>
  );
};

export default ContactForm;
