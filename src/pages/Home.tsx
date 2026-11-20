import { Contact } from "../sections/Contact";
import { Faq } from "../sections/Faq";
import { Hero } from "../sections/Hero";
import { Privacy } from "../sections/Privacy";
import { Process } from "../sections/Process";
import { Solutions } from "../sections/Solutions";
import { Tools } from "../sections/Tools";

// The home page's sections, in order.
export function Home() {
  return (
    <>
      <Hero />
      <Tools />
      <Solutions />
      <Process />
      <Privacy />
      <Faq />
      <Contact />
    </>
  );
}
