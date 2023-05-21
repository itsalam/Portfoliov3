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
  [key: string]: unknown;
};

export type Resume = {
  icon: SanityImageSrc;
  url: string;
  title: string;
};

export type CMSStore = {
  technologies: Technology[];
  projects: Project[];
  works: Work[];
  contacts: Social[];
  resume: Resume;
  imageBuilder: ImageUrlBuilder;
  getSrc: (src: SanityImageSrc) => string;
  isLoading: boolean;
};
