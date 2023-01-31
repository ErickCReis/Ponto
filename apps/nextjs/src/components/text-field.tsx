import { useTsController } from "@ts-react/form";
import clsx from "clsx";

import { DefaultTsFormProps } from "~/utils/form";

type TextFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  keyof DefaultTsFormProps
> &
  DefaultTsFormProps;

export const TextField = ({
  className,
  enumValues: _,
  ...rest
}: TextFieldProps) => {
  const { field, error } = useTsController<string>();
  return (
    <div className="flex flex-col">
      <input
        className={clsx(
          className,
          "rounded-sm border-zinc-400 bg-zinc-400 p-2 placeholder:text-zinc-200",
        )}
        {...rest}
        value={field.value ? field.value : ""}
        placeholder={field.name}
        onChange={(e) => {
          field.onChange(e.target.value);
        }}
      />
      {error?.errorMessage && (
        <span className="text-red-400">{error?.errorMessage}</span>
      )}
    </div>
  );
};
