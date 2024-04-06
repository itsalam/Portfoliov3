"use client";

import { CMSContext } from "@/lib/state";
import { cn } from "@/lib/utils";
import { Spinner } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { ArrowDown, Download } from "lucide-react";
import {
  ComponentProps,
  FC,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useStore } from "zustand";
import { BaseRolloutButton } from "../Buttons/BaseRolloutButton";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

const DownloadIcon = motion(Download);
const ArrowDownIcon = motion(ArrowDown);

const DownloadButton: FC<ComponentProps<typeof motion.button>> = (props) => {
  return (
    <BaseRolloutButton
      ComponentA={(props) => (
        <DownloadIcon
          size={42}
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
          size={42}
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
      className="absolute bottom-4"
      textSize="3"
      iconSize={30}
      iconVariants={{
        hover: {},
      }}
      {...props}
    />
  );
};

export default function ResumeCard(props: ComponentProps<typeof motion.div>) {
  const { className, ...rest } = props;
  const cardRef = useRef(null);
  const cms = useContext(CMSContext)!;
  const resume = useStore(cms, (cms) => cms.resume);
  const [cardWidth, setCardWidth] = useState(0);
  const [cardHeight, setCardHeight] = useState(0);

  useLayoutEffect(() => {
    const cardElement = cardRef.current;
    if (cardElement) {
      const observer = new ResizeObserver((entries) => {
        const { width, height } = entries[0].contentRect;
        setCardWidth(width);
        setCardHeight(height);
        // Do something with the width
      });
      observer.observe(cardElement);
      return () => {
        observer.unobserve(cardElement);
      };
    }
  }, [cardRef]);

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
    <motion.div
      {...rest}
      className={cn(
        "relative flex h-full flex-col items-center justify-center",
        className
      )}
      ref={cardRef}
      initial="initial"
    >
      {resume && (
        <>
          <Document
            file={resume.url}
            className="relative h-full w-full "
            loading={<Spinner className="m-auto" size={"3"} />}
          >
            <Page
              pageNumber={1}
              className="w-full"
              width={cardWidth}
              // height={cardHeight}
            />
          </Document>
          <DownloadButton onClick={handleDownload} />
        </>
      )}
    </motion.div>
  );
}
