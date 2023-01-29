import { createTsForm } from "@ts-react/form";
import { z } from "zod";
import { TextField } from "~/components/text-field";
import { TimeField } from "~/components/time-field";

const mapping = [
  [z.string(), TextField],
  [z.number(), TextField],
  [z.date(), TimeField],
] as const;

export const MyForm = createTsForm(mapping);
