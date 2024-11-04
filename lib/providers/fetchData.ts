import { client } from "@/sanity/lib/client";
import { TierResult, getGPUTier } from "detect-gpu";
import { SanityDocument } from "next-sanity";
import type { Image } from "sanity";
import { StoreApi } from "zustand";

type SanitySvgSrc = Image & { stroke: boolean };

export type Technology = Partial<SanityDocument> & {
  name: string;
  thumbnail: SanitySvgSrc;
  mainTech: boolean;
  [key: string]: unknown;
};

export type Work = Partial<SanityDocument> & {
  companyName: string;
  experiences: {
    title: string;
    from: string;
    to: string;
    descriptions: string[];
    location: string;
  }[];
  [key: string]: unknown;
};

export type Social = Partial<SanityDocument> & {
  value: string;
  thumbnail: SanitySvgSrc;
  link?: string;
  name: string;
  [key: string]: unknown;
};

export type Project = Partial<SanityDocument> & {
  name: string;
  description: string;
  fullDescription: string;
  githublink: string;
  link: string;
  thumbnails: Image[];
  stack: Technology[];
  [key: string]: unknown;
};

export type Resume = Partial<SanityDocument> & {
  icon: SanitySvgSrc;
  url: string;
  title: string;
};

export enum Schemas {
  technology = "technology",
  projects = "project",
  works = "works",
  contact = "contact",
  resume = "resume",
}

type SchemaTypes = {
  technology: Technology[];
  projects: Project[];
  works: Work[];
  contact: Social[];
  resume: Resume;
};

function isWebGLSupported() {
  try {
    const canvas = document.createElement("canvas");
    return (
      (!!window.WebGLRenderingContext &&
        (canvas.getContext("webgl") ||
          canvas.getContext("experimental-webgl"))) ??
      false
    );
  } catch (e) {
    return false;
  }
}

export type SchemaStores = {
  [K in keyof typeof Schemas]: SchemaTypes[K];
} & {
  initialize: () => void;
  isWebGLSupported: boolean | RenderingContext;
  gpuTier: TierResult;
};

// uses GROQ to query content: https://www.sanity.io/docs/groq
async function getSchema<T extends Partial<SanityDocument>>(
  schemaName: Schemas,
  additionalQuery?: string
): Promise<T | T[]> {
  const query = `*[_type == "${schemaName}"]${
    additionalQuery ?? " | order(_createdAt asc)"
  }`;
  const schema = await client.fetch<T | T[]>(query);
  return schema;
}

function makeSanityStore<T extends Partial<SanityDocument>>(
  schemaName: string,
  additionalQuery?: string
) {
  return async (set: StoreApi<T>["setState"]) => {
    // Use `any` or a more specific type for Zustand's set method if available
    const data = await getSchema<T>(
      Schemas[schemaName as keyof typeof Schemas],
      additionalQuery
    );
    set((state: Partial<T>) => ({
      ...state,
      [schemaName]: data,
    }));
  };
}

export const createCMSSlices = (
  setState: StoreApi<Partial<SchemaStores>>["setState"]
): Promise<void>[] => {
  const technology = makeSanityStore<Technology>("technology");
  const projects = makeSanityStore<Project>("projects", "{..., stack[]->}");
  const works = makeSanityStore<Work>("works");
  const contact = makeSanityStore<Social>("contact");
  const resume = makeSanityStore<Resume>(
    "resume",
    "[0]{title, icon, 'url': pdf.asset->url}"
  );
  const gpuTier = async () => {
    const gpuTier = await getGPUTier();
    setState((state) => ({
      ...state,
      gpuTier,
      isWebGLSupported: isWebGLSupported(),
    }));
  };

  return [
    technology(setState),
    projects(setState),
    works(setState),
    contact(setState),
    resume(setState),
    gpuTier(),
  ];
};
