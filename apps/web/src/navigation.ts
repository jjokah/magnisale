import { blog, nav } from "./content/site";

// The main navigation: the home page's sections, then the blog once it has a
// post. Used by the nav bar, the phone menu and the footer.
export const mainNavFor = (hasBlog: boolean) => (hasBlog ? [...nav, blog.link] : nav);

// The id of the home page section a link points at, if it points at one.
export const sectionOf = (href: string) => href.split("#")[1] ?? null;
