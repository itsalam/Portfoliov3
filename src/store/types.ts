import { ImageUrlBuilder } from '@sanity/image-url/lib/types/builder';

export type Technology = {
  name: string;
  thumbnail: {
    stroke?: boolean;
    name: string;
  };
};

export type Work = {
  companyName: string;
  experiences: {
    title: string;
    from: string;
    to: string;
    descriptions: string[];
  }[];
};

export type Contact = {
  value: string;
  thumbnail: {
    stroke?: boolean;
    name: string;
  };
};

export type CMSStore = {
  technologies: Technology[];
  projects: any;
  works: Work[];
  contact: Contact[];
  resume: any;
  imageBuilder: ImageUrlBuilder;
};
