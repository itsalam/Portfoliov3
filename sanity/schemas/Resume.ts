import { defineField, defineType } from "sanity";

export const Resume = defineType({
  name: "resume",
  type: "document",
  title: "Resume",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "PDF Title",
    }),
    defineField({
      name: "icon",
      type: "image",
      title: "Download Icon",
    }),
    defineField({
      name: "pdf",
      type: "file",
      title: "Resume PDF",
    }),
  ],
});
