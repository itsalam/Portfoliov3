
import {
    FormControl,
    FormLabel,
    FormHelperText,
    FormErrorMessage,
    Input,
    Textarea,
    Button,
} from "@vechaiui/react"
import { HTMLProps, ReactNode, useState } from "react"
import useStore from "@src/store";
import { Document, Page } from 'react-pdf/dist/esm/entry.vite'
import { debounce } from "lodash";
import { pageRef } from "./helper";

export default function Contact(props: HTMLProps<HTMLDivElement>) {
    const { imageBuilder, contact, resume } = useStore();
    const ref = pageRef().containerCallback;
    const [scale, setScale] = useState(1.0);

    const Label = (props: { children: ReactNode }) => {
        return <FormLabel className="mainText text-2xl py-1.5">
            {props.children}
        </FormLabel>
    }

    const TextInput = (props: { placeholder: string }) => {
        return <Input
            placeholder={props.placeholder}
            className="w-full border-2 border-foreground bg-fill/10 rounded-md"
        />
    }

    const TextArea = (props: { placeholder: string }) => {
        return <Textarea
            placeholder={props.placeholder}
            className="w-full border-2 border-foreground bg-fill/10 flex-1 rounded-md"
        />
    }

    const onPageLoad = debounce((page) => {
        const parentDiv = document.querySelector('#pdfDocument')
        if (parentDiv) {
            let pageScale = Math.min(
                parentDiv.clientWidth / page.originalWidth, 
                parentDiv.clientHeight / page.originalHeight
            )
            if (scale !== pageScale) {
                setScale(pageScale);
            }
        }
    }, 100);


    return <div className="h-[100vh]" id={"contact"} {...props} ref={ref}>
        <div className="h-[166vh] bg-base/10 relative mt-40">
            <div className="sticky h-[70vh] w-full bg-base/10 flex flex-col gap-5 px-4 top-[15%]">
                <h1 className="text-7xl relative left-0 w-full flex items-center gap-10">
                    Contact
                    <div className="h-[2px] w-1/3 bg-foreground" />
                </h1>
                <div className="w-full h-full flex gap-8 px-8">
                    <div className="flex flex-col w-3/5">

                        <h2 className="mainText text-xl">Interested in working together? Just drop me a message here.</h2>
                        <FormControl id="name" className="flex flex-col">
                            <Label>
                                Name
                            </Label>
                            <TextInput placeholder="" />
                        </FormControl>
                        <FormControl id="email" className="flex flex-col">
                            <Label>
                                Email
                            </Label>
                            <TextInput placeholder="" />
                        </FormControl>
                        <FormControl id="message" className="flex flex-col flex-1">
                            <Label>
                                Message
                            </Label>
                            <TextArea placeholder="" />
                        </FormControl>

                        <Button className="my-4 p-3 w-full border-2 border-foreground hover:bg-fill/30 rounded-md">SEND</Button>
                        <h4 className="mainText text-sm">Or just email me; its probably more convienient. ¯\_(ツ)_/¯</h4>
                        {contact.map((info) => {

                            const svgUrl = imageBuilder.image(info.thumbnail).url()
                            return <div key={info.value} className="w-full py-1 mainText text-2xl flex items-center align-middle">
                                <svg className="icon w-16 h-16" data-src={svgUrl} {...{ "fill": "currentColor" }} />
                                {info.value}
                            </div>
                        })}
                    </div>
                    <div className="flex flex-col w-2/5 h-full justify-center items-center">
                        <div className="flex max-h-[66%] max-w-full overflow-clip" id="pdfDocument">
                            <Document className="" file={resume.url}>
                                <Page 
                                    pageNumber={1} 
                                    renderTextLayer={false} 
                                    onLoadSuccess={onPageLoad} 
                                    scale={scale} 
                                    renderAnnotationLayer={false}
                                    key={`${scale}`} />
                            </Document>
                        </div>
                        <Button className="w-1/2 m-8 p-3 border-2 border-foreground hover:bg-fill/30 rounded-md">RESUME</Button>
                    </div>

                </div>

            </div>
        </div>
    </div>
}