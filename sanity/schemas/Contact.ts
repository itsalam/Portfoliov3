import { defineField, defineType } from "sanity";

export const Contact = defineType({
  name: "contact",
  type: "document",
  title: "Contact",
  fields: [
    defineField({
      name: "name",
      type: "string",
      title: "Name",
    }),
    defineField({
      name: "thumbnail",
      type: "image",
      title: "Thumbnail",
    }),
    defineField({
      name: "value",
      type: "string",
      title: "Value",
    }),
    defineField({
      name: "link",
      type: "string",
      title: "Link",
    }),
  ],
});
