import type { Metadata } from "next";

import { LandingPage } from "@/components/landing/landing-page";
import { site } from "@/components/landing/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "Gia Sư Nhà Mình | Tìm gia sư tiếng Anh 1 kèm 1 tại Cần Thơ",
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    siteName: site.name,
    title: "Gia Sư Nhà Mình | Tìm gia sư tiếng Anh phù hợp",
    description: site.description,
    images: [{ url: site.ogImage, width: 1200, height: 630, alt: site.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gia Sư Nhà Mình | Tìm gia sư tiếng Anh phù hợp",
    description: site.description,
    images: [site.ogImage],
  },
};

export default function HomePage() {
  return <LandingPage />;
}
