import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  experimental: { cpus: 1 },
  // Keep links from earlier versions of the site working.
  async redirects() {
    return [
      {
        source: "/yeu-cau-tim-gia-su",
        destination: "/get-started",
        permanent: true,
      },
      {
        source: "/chinh-sach-bao-mat",
        destination: "/privacy",
        permanent: true,
      },
      { source: "/dieu-khoan", destination: "/terms", permanent: true },
    ];
  },
};

export default nextConfig;
