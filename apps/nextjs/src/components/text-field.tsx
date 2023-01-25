import { useTsController } from "@ts-react/form";
import clsx from "clsx";

export const TextField = ({ className }: { className: string }) => {
  const { field, error } = useTsController<string>();
  return (
    <div className="flex flex-col">
      <input
        className={clsx(
          className,
          "rounded-sm border-zinc-400 bg-zinc-400 p-2 placeholder:text-zinc-200",
        )}
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
