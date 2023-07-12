import { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

type SanityImageSrc = SanityImageSource & { stroke: boolean };

export type Technology = {
  name: string;
  thumbnail: SanityImageSrc;
  mainTech: boolean;
  [key: string]: unknown;
};

export type Work = {
  companyName: string;
  experiences: {
    title: string;
    from: string;
    to: string;
    descriptions: string[];
  }[];
  [key: string]: unknown;
};

export type Social = {
  value: string;
  thumbnail: SanityImageSrc;
  link?: string;
  [key: string]: unknown;
};

export type Project = {
  name: string;
  description: string;
  fullDescription: string;
  githublink: string;
  link: string;
  thumbnails: SanityImageSrc[];
  stack: Technology[];
  [key: string]: unknown;
};

export type Resume = {
  icon: SanityImageSrc;
  url: string;
  title: string;
};

export enum Schemas {
  technology = 'technology',
  projects = 'projects',
  works = 'works',
  contact = 'contact',
  resume = 'resume'
}

export type SchemaStores = {
  technology: Technology[];
  projects: Project[];
  works: Work[];
  contact: Social[];
  resume: Resume;
};

export type CMSStore = SchemaStores & {
  imageBuilder: ImageUrlBuilder;
  getSrc: (src: SanityImageSrc) => string;
  isLoading: boolean;
  loadingProgress: () => number;
};
