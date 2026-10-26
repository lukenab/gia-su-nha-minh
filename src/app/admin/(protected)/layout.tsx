import type { Metadata } from "next";

import { requireAdminSession } from "@/features/admin-auth/server/guard";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { bodyFont, displayFont } from "@/features/landing/fonts";

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
      >
        {children}
      </AdminShell>
    </div>
  );
}
