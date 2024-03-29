import { defineField, defineType } from "sanity";

export const Technology = defineType({
  name: "technology",
  type: "document",
  title: "Technologies",
  fields: [
    defineField({
      name: "name",
      type: "string",
      title: "Name",
    }),
    defineField({
      name: "mainTech",
      type: "boolean",
      title: "Current Tech",
      initialValue: false,
    }),
    defineField({
      name: "thumbnail",
      type: "image",
      title: "Thumbnail",
      fields: [
        defineField({
          name: "stroke",
          type: "boolean",
          initialValue: false,
        }),
      ],
    }),
  ],
});
