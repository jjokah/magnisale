import type { ComponentProps } from "react";

type Look = {
  variant?: "primary" | "secondary" | "accent" | "danger";
  size?: "sm" | "md" | "lg";
};
type Props = Look & (({ href: string } & ComponentProps<"a">) | ({ href?: undefined } & ComponentProps<"button">));

// With an href it renders an <a>, for anchors, WhatsApp and email. Without one
// it is a real <button>, which submits a form only when asked to.
export function Button({ variant = "primary", size = "md", className = "", ...rest }: Props) {
  const sizeClass = size === "md" ? "" : `btn-${size}`;
  const classes = `btn btn-${variant} ${sizeClass} ${className}`;
  if (rest.href !== undefined) {
    return <a className={classes} {...rest} />;
  }
  return <button type="button" className={classes} {...rest} />;
}
