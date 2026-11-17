import type { ComponentProps } from "react";

type Look = {
  variant?: "primary" | "secondary" | "accent";
  size?: "sm" | "md" | "lg";
};
type Props = Look & (({ href: string } & ComponentProps<"a">) | ({ href?: undefined } & ComponentProps<"button">));

// Almost every action on this site is a link (an anchor, WhatsApp or email),
// so the button renders an <a> when it has an href. Without one it is a real
// <button>, as the enquiry form needs.
export function Button({ variant = "primary", size = "md", className = "", ...rest }: Props) {
  const sizeClass = size === "md" ? "" : `btn-${size}`;
  const classes = `btn btn-${variant} ${sizeClass} ${className}`;
  if (rest.href !== undefined) {
    return <a className={classes} {...rest} />;
  }
  return <button className={classes} {...rest} />;
}
