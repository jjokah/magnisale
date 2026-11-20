import { StructuredData } from "./components/StructuredData";
import { BlogList } from "./pages/BlogList";
import { BlogPost } from "./pages/BlogPost";
import { Home } from "./pages/Home";
import type { Route } from "./routes";
import { Footer } from "./sections/Footer";
import { MobileCta } from "./sections/MobileCta";
import { Nav } from "./sections/Nav";

// The shell every page shares, around the page the address asks for.
export function App({ route }: { route: Route }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-40 focus:rounded-md focus:bg-surface focus:px-4 focus:py-3 focus:font-semibold"
      >
        Skip to content
      </a>
      <Nav page={route.kind} />
      <main id="main">
        {route.kind === "home" && <Home />}
        {route.kind === "blog" && <BlogList tag={route.tag} />}
        {route.kind === "post" && <BlogPost post={route.post} html={route.html} />}
      </main>
      <Footer home={route.kind === "home"} />
      <MobileCta />
      <StructuredData route={route} />
    </>
  );
}
