import localFont from "next/font/local";

/*
 * Self-hosted fonts for the landing page only. Files were subset to Latin,
 * Latin Extended and Vietnamese (SIL Open Font License, Google Fonts).
 * Loaded locally so builds do not depend on network access.
 */
export const displayFont = localFont({
  src: "./fonts/SpaceGrotesk-Variable.woff2",
  weight: "300 700",
  variable: "--landing-font-display",
  display: "swap",
});

export const bodyFont = localFont({
  src: [
    { path: "./fonts/BeVietnamPro-Regular.woff2", weight: "400" },
    { path: "./fonts/BeVietnamPro-Medium.woff2", weight: "500" },
    { path: "./fonts/BeVietnamPro-SemiBold.woff2", weight: "600" },
    { path: "./fonts/BeVietnamPro-Bold.woff2", weight: "700" },
  ],
  variable: "--landing-font-body",
  display: "swap",
});
