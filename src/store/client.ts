import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { StateCreator, StoreApi } from 'zustand';
import {
  CMSStore,
  Project,
  Resume,
  Schemas,
  Social,
  Technology,
  Work
} from './types';

const client = createClient({
  projectId: 'tjaus1w5',
  dataset: 'production',
  useCdn: true, // set to `true` to fetch from edge cache
  apiVersion: '2023-03-20' // use current date (YYYY-MM-DD) to target the latest API version
  // token: process.env.SANITY_SECRET_TOKEN // Only if you want to update content with the client
});

// uses GROQ to query content: https://www.sanity.io/docs/groq
async function getSchema<T>(schemaName: string, additionalQuery?: string) {
  const query = `*[_type == "${schemaName}"]${
    additionalQuery ?? ' | order(_createdAt asc)'
  }`;
  const schema = await client.fetch<T>(query);
  return schema;
}

type Slice<T> = StateCreator<T> | StoreApi<T>;

function makeSanityStore<T>(schemaName: string, additionalQuery?: string) {
  return (set) => {
    getSchema<T>(schemaName, additionalQuery).then((res) =>
      set({ [schemaName]: res })
    );
    return {
      [schemaName]: null
    };
  };
}

const createCMSSlice: StateCreator<Partial<CMSStore>> = (
  setState,
  getState
) => {
  const initialState: Partial<CMSStore> = {
    technology: [],
    project: [],
    works: [],
    contact: [],
    resume: undefined,
    imageBuilder: imageUrlBuilder(client),
    loadingProgress: () => {
      const state = getState();
      const schemas = Object.keys(Schemas);
      const total = schemas.length;
      const loaded = Object.entries(state).filter(
        ([k, v]) => schemas.includes(k) && v
      ).length;
      if (loaded === total && state.isLoading) {
        setState({ isLoading: false });
      }
      return Math.floor((loaded / total) * 100);
    },
    getSrc: (src: SanityImageSource) =>
      getState().imageBuilder?.image(src).url() ?? '',
    isLoading: true
  };

  const technology = makeSanityStore<Technology>('technology');
  const project = makeSanityStore<Project>('project');
  const works = makeSanityStore<Work>('works');
  const contact = makeSanityStore<Social>('contact');
  const resume = makeSanityStore<Resume>(
    'resume',
    "[0]{title, icon, 'url': pdf.asset->url}"
  );

  return {
    ...technology(setState),
    ...project(setState),
    ...works(setState),
    ...contact(setState),
    ...resume(setState),
    ...initialState
  };
};

export default createCMSSlice;
