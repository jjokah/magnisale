import type { ComponentProps } from "react";

type Props = ComponentProps<"a"> & {
  variant?: "primary" | "secondary" | "accent";
  size?: "sm" | "md" | "lg";
};

// Every action on this site is a link (an anchor or an email), so the button
// renders an <a>.
export function Button({ variant = "primary", size = "md", className = "", ...rest }: Props) {
  const sizeClass = size === "md" ? "" : `btn-${size}`;
  return <a className={`btn btn-${variant} ${sizeClass} ${className}`} {...rest} />;
}
