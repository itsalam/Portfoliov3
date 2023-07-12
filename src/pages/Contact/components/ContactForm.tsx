import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ArrowSVG, isWideListener } from '@src/etc/Helpers';
import { useForm } from 'react-hook-form';
import FormInput from './FormInput';

const FormSubmitButton = () => (
  <Button
    type="submit"
    variant="default"
    className="primary-color group mt-2 inline-flex h-12 w-56 overflow-hidden font-semibold transition-all duration-150 ease-in-out hover:pl-10 hover:pr-6"
  >
    <span className="primary-color absolute bottom-0 left-0 h-1 w-full transition-all duration-150 ease-in-out group-hover:h-full" />
    <span className="absolute right-0 pr-4 duration-200 ease-out group-hover:translate-x-12">
      <ArrowSVG className="text-primary-color h-5 w-5" />
    </span>
    <span className="absolute left-0 -translate-x-12 pl-2.5 duration-200 ease-out group-hover:translate-x-0">
      <ArrowSVG className="text-background h-5 w-5" />
    </span>
    <span className="relative w-full text-left transition-colors duration-200 ease-in-out">
      Send message
    </span>
  </Button>
);

const ContactForm = () => {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  const isWide = isWideListener();

  const submitContact = async (data: RequestInit | undefined) => {
    notifications.show({ loading: true, title: 'Sending message...', message: 'Awaiting response..' });
    fetch('/sendContactMail', {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then((res: Response) => {
        if (res.status !== 200) {
          throw new Error(res.statusText);
        } else notifications.show({ color: 'green', title: 'Message sent!', message: 'I will get back to you as soon as possible.' });
      })
      .catch(() => {
        notifications.show({
          title: 'Oops, guess something went wrong.',
          message: " 🙃 I'll check it out in a bit.",
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
