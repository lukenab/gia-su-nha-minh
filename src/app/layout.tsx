import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Gia Sư Nhà Mình | Kết nối gia sư tiếng Anh",
  description:
    "Gửi nhu cầu học tiếng Anh 1 kèm 1 và nhận hỗ trợ tìm gia sư phù hợp tại Cần Thơ.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
