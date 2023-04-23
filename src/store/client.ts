import { createClient } from '@sanity/client';
import { StateCreator } from 'zustand';
import imageUrlBuilder from '@sanity/image-url';
import { AsyncCMSStore, CMSStore } from './types';

export const client = createClient({
  projectId: 'tjaus1w5',
  dataset: 'production',
  useCdn: false, // set to `true` to fetch from edge cache
  apiVersion: '2023-03-20' // use current date (YYYY-MM-DD) to target the latest API version
  // token: process.env.SANITY_SECRET_TOKEN // Only if you want to update content with the client
});

// uses GROQ to query content: https://www.sanity.io/docs/groq
export async function getSchema(schemaName: string) {
  const schema = await client.fetch(
    `*[_type == "${schemaName}"] | order(_createdAt asc)`
  );
  return schema;
}

export async function getResume() {
  const schema = await client.fetch(
    "*[_type == 'resume'] {title, icon, 'url': pdf.asset->url}"
  );
  return schema[0];
}

const createCMSSlice: StateCreator<AsyncCMSStore> = (setState) => {
  const initialState: AsyncCMSStore = {
    technologies: [],
    projects: [],
    works: [],
    contact: [],
    imageBuilder: imageUrlBuilder(client),
    isLoading: true
  };
  async function fetchData() {
    const schema: CMSStore = await {
      technologies: await getSchema('technology'),
      projects: await getSchema('project'),
      works: await getSchema('works'),
      contact: await getSchema('contact'),
      resume: await getResume(),
      imageBuilder: imageUrlBuilder(client),
      isLoading: false
    };
    setState(schema);
  }
  fetchData();

  return initialState;
};

export default createCMSSlice;
