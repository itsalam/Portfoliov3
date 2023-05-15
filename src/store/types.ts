import { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder';

export type Technology = {
  name: string;
  thumbnail: {
    stroke?: boolean;
    name: string;
  };
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

export type Contact = {
  value: string;
  thumbnail: {
    stroke?: boolean;
    name: string;
  };
  [key: string]: unknown;
};

export type Project = {
  name: string;
  description: string;
  fullDescription: string;
  githublink: string;
  link: string;
  thumbnails: any;
  [key: string]: unknown;
};

export type Resume = {
  icon: {
    stroke?: boolean;
    name: string;
  };
  url: string;
  title: string;
};

export type CMSStore = {
  technologies: Technology[];
  projects: Project[];
  works: Work[];
  contact: Contact[];
  resume: Resume;
  imageBuilder: ImageUrlBuilder;
  isLoading: boolean;
};

export type AsyncCMSStore = Partial<CMSStore>;
