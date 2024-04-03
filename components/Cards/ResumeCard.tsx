"use client";

import { CMSContext } from "@/lib/state";
import { cn } from "@/lib/utils";
import { Spinner } from "@radix-ui/themes";
import { motion } from "framer-motion";
import {
  ComponentProps,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useStore } from "zustand";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

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
      )}
    </motion.div>
  );
}
