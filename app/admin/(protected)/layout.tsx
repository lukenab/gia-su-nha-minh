import Link from "next/link";
import { redirect } from "next/navigation";

import { isAdminAuthenticated } from "@/lib/admin-session";

import { LogoutButton } from "./logout-button";
import { AdminNavigation } from "./navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="brand admin-brand" href="/admin">
          <span className="brand-mark">NM</span>
          <span className="brand-name">
            Gia Sư <strong>Nhà Mình</strong>
          </span>
        </Link>
        <div className="workspace-label">KHÔNG GIAN LÀM VIỆC</div>
        <AdminNavigation />
        <div className="sidebar-bottom">
          <div className="sidebar-phase">
            <span className="sidebar-phase-dot" />
            <div>
              <strong>Giai đoạn FE-01</strong>
              <small>Tiếp nhận yêu cầu học</small>
            </div>
          </div>
          <Link href="/" target="_blank">
            Xem trang người học <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-caption">
            Gia Sư Nhà Mình <span>/</span> Quản trị
          </div>
          <div className="topbar-right">
            <span className="admin-badge">
              <span /> Quản trị viên
            </span>
            <LogoutButton />
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
