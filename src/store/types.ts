import { ImageUrlBuilder } from "@sanity/image-url/lib/types/builder";

export type Technology = {
    thumbnail: {
        stroke?: boolean,
    name: string,
}   }

export type CMSStore = {
    technologies: Technology[],
    projects: any,
    works: any,
    contact: any,
    resume: any,
    imageBuilder: ImageUrlBuilder,
} 