import { StructuredData } from "./components/StructuredData";
import { Contact } from "./sections/Contact";
import { Faq } from "./sections/Faq";
import { Footer } from "./sections/Footer";
import { Hero } from "./sections/Hero";
import { MobileCta } from "./sections/MobileCta";
import { Nav } from "./sections/Nav";
import { Privacy } from "./sections/Privacy";
import { Process } from "./sections/Process";
import { Solutions } from "./sections/Solutions";
import { Tools } from "./sections/Tools";

export function App() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-40 focus:rounded-md focus:bg-surface focus:px-4 focus:py-3 focus:font-semibold"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <Tools />
        <Solutions />
        <Process />
        <Privacy />
        <Faq />
        <Contact />
      </main>
      <Footer />
      <MobileCta />
      <StructuredData />
    </>
  );
}
