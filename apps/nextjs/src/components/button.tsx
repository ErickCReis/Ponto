import clsx from "clsx";

const buttonStyle = clsx([
  "rounded-lg",
  "bg-white/10",
  "px-6",
  "py-3",
  "font-semibold",
  "text-white",
  "no-underline",
  "transition",
  "hover:bg-white/20",
]);

export const Button = ({
  children,
  onClick,
}: {
  children?: React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <button className={buttonStyle} onClick={onClick}>
      {children}
    </button>
  );
};
