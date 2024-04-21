import { useTsController } from "@ts-react/form";
import clsx from "clsx";

import dayjs, { Dayjs } from "~/old/utils/dayjs";
import { DefaultTsFormProps } from "~/old/utils/form";

type TimeFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  keyof DefaultTsFormProps | "type" | "min" | "max"
> &
  DefaultTsFormProps & {
    min?: Dayjs;
    max?: Dayjs;
  };

export const TimeField = ({
  className,
  min,
  max,
  enumValues: _,
  beforeElement: __,
  afterElement: ___,
  ...rest
}: TimeFieldProps) => {
  const { field, error } = useTsController<Date>();

  return (
    <input
      type="datetime-local"
      className={clsx(
        className,
        "rounded-sm border-zinc-400 bg-zinc-400 p-2 placeholder:text-zinc-200",
        error && "border-red-500",
      )}
      {...rest}
      value={field.value ? dayjs(field.value).format("YYYY-MM-DD[T]HH:mm") : ""}
      onChange={(e) => {
        field.onChange(dayjs(e.target.value).toDate());
      }}
      min={min ? min.format("YYYY-MM-DD[T]HH:mm") : undefined}
      max={max ? max.format("YYYY-MM-DD[T]HH:mm") : undefined}
    />
  );
};
