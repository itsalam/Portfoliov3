import { FormControl, FormControlProps, FormLabel, Input, InputProps, Textarea, TextareaProps } from "@vechaiui/react";
import { HTMLProps, ReactNode, forwardRef } from "react";
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
    <FormLabel className="capitalize">{props.children}</FormLabel>

const TextInput = forwardRef((props: HTMLProps<HTMLTextAreaElement> & InputProps, _) =>
    <Input
        {...props}
        className="border-foreground bg-fill/10 w-full rounded-md border-2 "
    />)

const TextArea = forwardRef((props: HTMLProps<HTMLTextAreaElement> & TextareaProps, _) =>
    <Textarea
        {...props}
        className="border-foreground bg-fill/10 w-full flex-1 rounded-md border-2 "
    />)

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