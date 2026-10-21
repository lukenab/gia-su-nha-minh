import { Audience } from "./audience";
import { Faq } from "./faq";
import { FinalCta } from "./final-cta";
import { Hero } from "./hero";
import { Journey } from "./journey";
import { Manifesto } from "./manifesto";
import { ScrollProgress } from "./scroll-progress";
import { Showcase } from "./showcase";
import { SiteShell } from "./site-shell";

export function LandingPage() {
  return (
    <SiteShell before={<ScrollProgress />}>
      <Hero />
      <Manifesto />
      <Journey />
      <Showcase />
      <Audience />
      <Faq />
      <FinalCta />
    </SiteShell>
  );
}
