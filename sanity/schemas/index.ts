import { type SchemaTypeDefinition } from "sanity";
import { Contact } from "./Contact";
import { Projects } from "./Projects";
import { Resume } from "./Resume";
import { Technology } from "./Technology";
import { Works } from "./Works";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [Works, Projects, Technology, Contact, Resume],
};
