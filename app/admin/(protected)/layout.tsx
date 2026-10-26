import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/admin-shell";
import { bodyFont, displayFont } from "@/components/landing/fonts";
import { requireAdminSession } from "@/lib/admin-guard";

export const metadata: Metadata = {
  title: "Quản trị | Gia Sư Nhà Mình",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();

  return (
    <div className={`${displayFont.variable} ${bodyFont.variable}`}>
      <AdminShell
        operator={session.operator}
        email={session.method === "local" ? "Đăng nhập local" : session.email}
      >{children}</AdminShell>
    </div>
  );
}
