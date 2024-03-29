import { defineField, defineType } from "sanity";

export const Works = defineType({
  name: "works",
  type: "document",
  title: "Works",
  fields: [
    defineField({
      name: "companyName",
      type: "string",
      title: "Company Name",
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
    defineField({
      name: "experiences",
      type: "array",
      of: [
        {
          name: "experience",
          type: "object",
          title: "Work Experience",
          fields: [
            defineField({
              name: "title",
              type: "string",
              title: "Title of Experience",
            }),
            defineField({
              name: "location",
              type: "string",
              title: "Location",
            }),
            defineField({
              name: "from",
              type: "date",
              title: "Start Date",
            }),
            defineField({
              name: "to",
              type: "date",
              title: "End Date",
            }),
            defineField({
              name: "descriptions",
              type: "array",
              title: "Experience bullet point descriptions",
              of: [
                {
                  name: "description",
                  type: "text",
                  title: "bullet point description",
                },
              ],
            }),
          ],
        },
      ],
    }),
  ],
});
