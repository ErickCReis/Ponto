import { useDescription, useTsController } from "@ts-react/form";
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
  beforeElement: __,
  afterElement: ___,
  ...rest
}: TextFieldProps) => {
  const { field, error } = useTsController<string | number>();
  const { label, placeholder } = useDescription();

  return (
    <div className="flex flex-col">
      <label className="text-sm font-bold">{label}</label>
      <div className="h-1"></div>
      <input
        className={clsx(
          className,
          "rounded-sm border-zinc-400 bg-zinc-400 p-2 placeholder:text-zinc-200",
        )}
        placeholder={placeholder ?? field.name}
        {...rest}
        value={field.value != undefined ? field.value : ""}
        onChange={(e) => {
          if (rest.type === "number") {
            field.onChange(Number(e.target.value));
            return;
          }

          field.onChange(e.target.value);
        }}
      />
      {error?.errorMessage && (
        <span className="text-red-400">{error?.errorMessage}</span>
      )}
    </div>
  );
};
