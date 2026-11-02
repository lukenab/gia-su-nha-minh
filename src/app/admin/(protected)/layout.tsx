import type { Metadata } from "next";

import { requireAdminSession } from "@/features/admin-auth/server/guard";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { adminFontVariables } from "@/features/admin/fonts";

export const metadata: Metadata = {
  title: "Nexus Workspace",
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
    <div className={adminFontVariables}>
      <AdminShell
        operator={session.operator}
        email={session.method === "local" ? "Local sign-in" : session.email}
      >
        {children}
      </AdminShell>
    </div>
  );
}
