import { createTsForm } from "@ts-react/form";
import { z } from "zod";
import { TextField } from "~/components/text-field";

const mapping = [
  [z.string(), TextField],
  [z.number(), TextField],
] as const;

export const MyForm = createTsForm(mapping);
