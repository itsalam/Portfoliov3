import { defineField, defineType } from "sanity";

export const Project = defineType({
  name: "project",
  type: "document",
  title: "Project",
  fields: [
    defineField({
      name: "name",
      type: "string",
      title: "Name",
    }),
    defineField({
      name: "fullDescription",
      type: "text",
      title: "Full Description",
    }),
    defineField({
      name: "description",
      type: "string",
      title: "Description",
    }),
    defineField({
      name: "githublink",
      type: "string",
      title: "GitHub Link",
    }),
    defineField({
      name: "link",
      type: "string",
      title: "Link",
    }),
    defineField({
      name: "thumbnails",
      type: "array",
      title: "Thumbnails",
      of: [
        {
          name: "thumbnail",
          type: "image",
          title: "Thumbnail",
        },
      ],
    }),
    defineField({
      name: "stack",
      type: "array",
      of: [
        {
          title: "Technology",
          name: "techs",
          type: "reference",
          to: [{ type: "technology" }],
          weak: true,
        },
      ],
    }),
  ],
});
