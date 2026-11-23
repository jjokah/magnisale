import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";
import { resolveRoute } from "./routes";
import "./styles.css";

const root = document.getElementById("root")!;

// The address decides the page. On a post, its text loads first, so the
// browser's first render matches the prerendered page.
resolveRoute(location.pathname).then((route) => {
  const app = (
    <StrictMode>
      <App route={route} />
    </StrictMode>
  );
  // The built page is prerendered, so hydrate it; in development the root is empty.
  if (root.hasChildNodes()) {
    hydrateRoot(root, app);
  } else {
    createRoot(root).render(app);
  }
});
