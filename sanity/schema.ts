import { type SchemaTypeDefinition } from "sanity";
import { Contact } from "./schemas/Contact";
import { Projects } from "./schemas/Projects";
import { Resume } from "./schemas/Resume";
import { Technology } from "./schemas/Technology";
import { Works } from "./schemas/Works";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [Works, Projects, Technology, Contact, Resume],
};
