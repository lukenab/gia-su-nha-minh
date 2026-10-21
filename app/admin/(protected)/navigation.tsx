"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNavigation() {
  const pathname = usePathname();
  return (
    <nav className="admin-nav" aria-label="Điều hướng quản trị">
      <Link className={pathname === "/admin" ? "active" : ""} href="/admin">
        <span className="nav-icon">◫</span> Tổng quan
      </Link>
      <Link
        className={pathname.startsWith("/admin/requests") ? "active" : ""}
        href="/admin/requests"
      >
        <span className="nav-icon">▤</span> Yêu cầu học
      </Link>
      <Link
        className={pathname.startsWith("/admin/tutors") ? "active" : ""}
        href="/admin/tutors"
      >
        <span className="nav-icon">◎</span> Hồ sơ gia sư
      </Link>
    </nav>
  );
}
