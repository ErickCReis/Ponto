import { createTsForm } from "@ts-react/form";
import { ReactNode } from "react";
import { z } from "zod";
import { TextField } from "~/components/text-field";
import { TimeField } from "~/components/time-field";

const mapping = [
  [z.string(), TextField],
  [z.number(), TextField],
  [z.date(), TimeField],
] as const;

export const MyForm = createTsForm(mapping);
export const createMyForm = (
  FormComponent: <
    T extends Record<string, unknown> & {
      children: ReactNode;
      onSubmit: () => void;
    },
  >(
    props: T,
  ) => JSX.Element,
) => createTsForm(mapping, { FormComponent });
