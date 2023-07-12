import { Textarea, TextInput } from '@mantine/core';
import { HTMLProps } from 'react';
import { FieldValues, UseFormRegister } from 'react-hook-form';

type FormInputProps = {
  id: string;
  required?: boolean;
  text?: boolean;
  invalid: boolean;
  isWide: boolean;
  register: UseFormRegister<FieldValues>;
};

const FormInput = (
  props: HTMLProps<HTMLDivElement> & FormInputProps
) => {
  const label = props.isWide ? props.id[0].toUpperCase() + props.id.slice(1) : '';

  return props.text ? (
    <Textarea
      id={props.id}
      label={label}
      rows={4}
      className="muted-color w-full rounded-md"
      placeholder={props.isWide ? '' : props.placeholder ?? props.id}
      {...props.register(props.id, { required: props.required })}
    />
  ) : (
    <TextInput
      id={props.id}
      label={label}
      className="muted-color w-full rounded-md"
      placeholder={props.isWide ? '' : props.placeholder ?? props.id}
      {...props.register(props.id, { required: props.required })}
    />
  );
};

export default FormInput;
