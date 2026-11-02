import type { MetadataRoute } from "next";

import { site } from "@/shared/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/get-started", "/become-a-tutor", "/privacy", "/terms"].map(
    (path) => ({ url: `${site.url}${path === "/" ? "" : path}` }),
  );
}
