import {createClient} from '@sanity/client'
import { StateCreator, StoreApi } from 'zustand'
import imageUrlBuilder from '@sanity/image-url'
import { CMSStore } from './types'

export const client = createClient({
  projectId: 'tjaus1w5',
  dataset: 'production',
  useCdn: true, // set to `true` to fetch from edge cache
  apiVersion: '2023-03-20', // use current date (YYYY-MM-DD) to target the latest API version
  // token: process.env.SANITY_SECRET_TOKEN // Only if you want to update content with the client
})

// uses GROQ to query content: https://www.sanity.io/docs/groq
export async function getSchema(schemaName: string) {
  const schema = await client.fetch(`*[_type == "${schemaName}"] | order(_createdAt asc)`)
  return schema
}

export async function getResume() {
  const schema = await client.fetch("*[_type == 'resume'] {title, 'url': pdf.asset->url}")
  return schema[0]
}

const builder = imageUrlBuilder(client)

const techs = await getSchema("technology")
const projects = await getSchema("project")
const works = await getSchema("works")
const contact = await getSchema("contact")
const resume = await getResume()

const createCMSSlice: StateCreator<any, [], [], CMSStore> = (
    set:
      | StoreApi<unknown>
      | ((partial: unknown, replace?: boolean | undefined) => void)
      | (() => unknown)
  ): CMSStore => ({
    technologies: techs,
    projects,
    works,
    contact,
    resume,
    imageBuilder: builder
  });
  
export default createCMSSlice;