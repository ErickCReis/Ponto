import clsx from "clsx";

export const defaultStyle = [
  "rounded-lg",
  "bg-white/10",
  "px-6",
  "py-3",
  "font-semibold",
  "text-white",
  "no-underline",
  "transition",
  "hover:bg-white/20",
];

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <button className={clsx(...defaultStyle, className)} {...props}>
      {children}
    </button>
  );
};
