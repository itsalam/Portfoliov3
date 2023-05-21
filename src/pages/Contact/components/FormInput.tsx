import { FormControlProps, FormControl, Textarea, Input, InputProps, TextareaProps, FormLabel } from "@vechaiui/react";
import { HTMLProps, ReactNode } from "react";
import { FieldValues, UseFormRegister } from "react-hook-form";

type FormInputProps = {
    id: string;
    required?: boolean;
    text?: boolean;
    invalid: boolean;
    isWide: boolean,
    register: UseFormRegister<FieldValues>,
};

const Label = (props: { children: ReactNode }) =>
    <FormLabel className="subText capitalize">{props.children}</FormLabel>

const TextInput = (props: HTMLProps<HTMLTextAreaElement> & InputProps) =>
    <Input
        {...props}
        className="border-foreground bg-fill/10 w-full rounded-md border-2 "
    />

const TextArea = (props: HTMLProps<HTMLTextAreaElement> & TextareaProps) =>
    <Textarea
        {...props}
        className="border-foreground bg-fill/10 w-full flex-1 rounded-md border-2 "
    />

const FormInput = (props: HTMLProps<HTMLDivElement>
    & FormControlProps
    & FormInputProps
) =>
    <FormControl
        id={props.id}
        className={'flex flex-col flex-1 gap-1 ' + props.className}
        invalid={props.invalid}
    >
        {props.isWide && <Label>{props.id}</Label>}
        {props.text ? (
            <TextArea
                placeholder={props.isWide ? '' : props.placeholder ?? props.id}
                {...props.register(props.id, { required: props.required })}
            />
        ) : (
            <TextInput
                placeholder={props.isWide ? '' : props.placeholder ?? props.id}
                {...props.register(props.id, { required: props.required })}
            />
        )}
    </FormControl>

export default FormInput;