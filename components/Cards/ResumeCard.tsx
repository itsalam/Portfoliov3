"use client";

import { useResizeCallBack } from "@/lib/hooks";
import { CMSContext } from "@/lib/providers/state";
import { cn } from "@/lib/utils";
import { Spinner } from "@radix-ui/themes";
import { m } from "framer-motion";
import { debounce } from "lodash";
import { ArrowDown, Download } from "lucide-react";
import {
  ComponentProps,
  FC,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useStore } from "zustand";
import { BaseRolloutButton } from "../Buttons/BaseRolloutButton";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

const DownloadIcon = m(Download);
const ArrowDownIcon = m(ArrowDown);

const DownloadButton: FC<ComponentProps<typeof m.button>> = (props) => {
  return (
    <BaseRolloutButton
      ComponentA={(props) => (
        <DownloadIcon
          {...props}
          initial={{
            y: 0,
          }}
          variants={{
            hover: {
              y: "100%",
            },
          }}
        />
      )}
      ComponentB={(props) => (
        <ArrowDownIcon
          {...props}
          initial={{
            opacity: 1,
            y: "-100%",
          }}
          variants={{
            hover: {
              y: "0%",
              opacity: 1,
            },
          }}
        />
      )}
      text={"Download"}
      className={
        "absolute card-bg bottom-4 z-50 border-[--accent-11] p-2 text-[--accent-11] "
      }
      textSize="3"
      iconSize={32}
      iconVariants={{
        hover: {},
      }}
      {...props}
    />
  );
};

export default function ResumeCard(props: ComponentProps<typeof m.div>) {
  const { className, ...rest } = props;
  const cardRef = useRef(null);
  const cms = useContext(CMSContext)!;
  const resume = useStore(cms, (cms) => cms.resume);
  const [cardWidth, setCardWidth] = useState(0);
  // const [cardHeight, setCardHeight] = useState(0);

  const updateDimensions = debounce((entries) => {
    const { width } = entries[0].contentRect;
    setCardWidth(width);
    // setCardHeight(height);
    // Do something with the width
  }, 100);
  useResizeCallBack(updateDimensions, cardRef);

  const ResumeContent = useCallback(() => {
    const handleDownload = () => {
      if (!resume) return;
      fetch(resume?.url)
        .then((res) => res.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", resume.title);

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
    };
    return (
      resume && (
        <>
          <Document
            file={resume.url}
            className="relative h-full w-full"
            loading={
              <Spinner
                className="m-auto"
                size={"3"}
              />
            }
          >
            <Page
              pageNumber={1}
              className="w-full"
              width={cardWidth}
            />
          </Document>
          <DownloadButton onClick={handleDownload} />
        </>
      )
    );
  }, [resume, cardWidth]);

  return (
    <m.div
      {...rest}
      className={cn(
        "relative flex h-full flex-col items-center justify-center",
        className
      )}
      ref={cardRef}
      initial="initial"
    >
      <ResumeContent />
    </m.div>
  );
}
