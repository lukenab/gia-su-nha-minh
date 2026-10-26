"use client";

import Image from "next/image";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import logo from "@/components/landing/brand/logo-horizontal.png";

import styles from "./admin.module.css";
import {
  IconClose,
  IconDashboard,
  IconInbox,
  IconLink,
  IconMenu,
  IconTutor,
} from "./icons";

const GROUPS = [
  {
    heading: "Tiếp nhận",
    items: [
      { href: "/admin", label: "Tổng quan", icon: IconDashboard, exact: true },
      { href: "/admin/requests", label: "Yêu cầu học", icon: IconInbox },
      { href: "/admin/tutors", label: "Hồ sơ gia sư", icon: IconTutor },
    ],
  },
  {
    heading: "Kết nối",
    items: [{ href: "/admin/connections", label: "Kết nối", icon: IconLink }],
  },
];

const SECTION_LABELS: Record<string, string> = {
  requests: "Yêu cầu học",
  tutors: "Hồ sơ gia sư",
  connections: "Kết nối",
};

function breadcrumbs(pathname: string) {
  const parts = pathname.split("/").filter(Boolean).slice(1);
  const crumbs: { label: string; href?: string }[] = [
    { label: "Quản trị", href: "/admin" },
  ];
  if (!parts.length) return [{ label: "Tổng quan" }];
  const section = parts[0] ?? "";
  const base = `/admin/${section}`;
  crumbs.push({
    label: SECTION_LABELS[section] ?? "Trang",
    href: parts.length > 1 ? base : undefined,
  });
  if (parts.length > 1) {
    crumbs.push({
      label: parts[2] === "match" ? "Chi tiết" : "Chi tiết",
      href: parts[2] ? `${base}/${parts[1]}` : undefined,
    });
  }
  if (parts[2] === "match") crumbs.push({ label: "Chọn gia sư" });
  return crumbs;
}

function NavigationPending() {
  const { pending } = useLinkStatus();
  return pending ? (
    <span className={styles.navPending} aria-hidden="true" />
  ) : null;
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="Điều hướng quản trị">
      {GROUPS.map((group) => (
        <div className={styles.navGroup} key={group.heading}>
          <p className={styles.navHeading}>{group.heading}</p>
          <ul className={styles.navList}>
            {group.items.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={styles.navLink}
                    aria-current={active ? "page" : undefined}
                    onClick={onNavigate}
                  >
                    <Icon />
                    {item.label}
                    <NavigationPending />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className={styles.sidebarInner}>
      <div className={styles.brand}>
        <Link
          href="/admin"
          aria-label="Gia Sư Nhà Mình, tổng quan quản trị"
          onClick={onNavigate}
        >
          <Image src={logo} alt="" priority sizes="180px" />
        </Link>
      </div>
      <Navigation onNavigate={onNavigate} />
      <div className={styles.sidebarFoot}>
        <a href="/" target="_blank" rel="noreferrer">
          Mở trang công khai ↗
        </a>
      </div>
    </div>
  );
}

function initialsOf(name: string) {
  const words = name.trim().split(/\s+/);
  const letters =
    words.length > 1
      ? `${words[0]?.[0] ?? ""}${words[words.length - 1]?.[0] ?? ""}`
      : (words[0] ?? "").slice(0, 2);
  return letters.toUpperCase();
}

function ProfileMenu({
  operator,
  email,
  loggingOut,
  onLogout,
}: {
  operator: string;
  email: string;
  loggingOut: boolean;
  onLogout: () => void;
}) {
  const profileRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        profileButtonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div className={styles.profile} ref={profileRef}>
      <button
        ref={profileButtonRef}
        type="button"
        className={styles.profileTrigger}
        aria-label={`Tài khoản ${operator}`}
        aria-expanded={open}
        aria-controls={open ? "admin-profile-dropdown" : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        <span className={styles.avatar} aria-hidden="true">
          {initialsOf(operator)}
        </span>
        <span className={styles.profileTriggerName}>{operator}</span>
        <span className={styles.profileChevron} aria-hidden="true" />
      </button>
      {open && (
        <div id="admin-profile-dropdown" className={styles.profileDropdown}>
          <p className={styles.profileLabel}>Tài khoản quản trị</p>
          <strong className={styles.profileName}>{operator}</strong>
          <span className={styles.profileEmail}>{email}</span>
          <div className={styles.profileDivider} />
          <button
            type="button"
            className={styles.profileLogout}
            onClick={onLogout}
            disabled={loggingOut}
          >
            {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
          </button>
        </div>
      )}
    </div>
  );
}

export function AdminShell({
  operator,
  email,
  children,
}: {
  operator: string;
  email: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDialogElement>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  function closeDrawer() {
    if (drawerRef.current?.open) drawerRef.current.close();
  }

  // Close the drawer after navigating and when the viewport becomes desktop.
  useEffect(() => {
    closeDrawer();
  }, [pathname]);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 960px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) closeDrawer();
    };
    query.addEventListener("change", onChange);
    return () => {
      query.removeEventListener("change", onChange);
      document.body.style.removeProperty("overflow");
    };
  }, []);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setLogoutError("");
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) throw new Error("logout failed");
      window.location.assign("/admin/login?status=signed_out");
    } catch {
      setLogoutError("Chưa thể đăng xuất. Vui lòng thử lại.");
      setLoggingOut(false);
    }
  }

  const crumbs = breadcrumbs(pathname);

  return (
    <div className={styles.root}>
      <a className={styles.skip} href="#admin-main">
        Bỏ qua điều hướng
      </a>
      <aside className={styles.sidebar} aria-label="Thanh bên quản trị">
        <Sidebar />
      </aside>

      <dialog
        ref={drawerRef}
        className={styles.drawer}
        aria-label="Menu điều hướng"
        onClose={() => document.body.style.removeProperty("overflow")}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDrawer();
        }}
      >
        <button
          type="button"
          className={`${styles.iconButton} ${styles.drawerClose}`}
          onClick={closeDrawer}
          aria-label="Đóng menu"
        >
          <IconClose />
        </button>
        <Sidebar onNavigate={closeDrawer} />
      </dialog>

      <div className={styles.body}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              type="button"
              className={`${styles.iconButton} ${styles.menuButton}`}
              aria-label="Mở menu"
              onClick={() => {
                drawerRef.current?.showModal();
                document.body.style.overflow = "hidden";
              }}
            >
              <IconMenu />
            </button>
            <nav aria-label="Vị trí hiện tại">
              <ol className={styles.crumbs}>
                {crumbs.map((crumb, index) => (
                  <li key={`${crumb.label}-${index}`}>
                    {crumb.href ? (
                      <Link href={crumb.href}>{crumb.label}</Link>
                    ) : (
                      <span aria-current="page">{crumb.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          </div>
          <div className={styles.headerRight}>
            <ProfileMenu
              key={pathname}
              operator={operator}
              email={email}
              loggingOut={loggingOut}
              onLogout={logout}
            />
          </div>
        </header>
        {logoutError && (
          <p
            className={`${styles.message} ${styles.messageError}`}
            role="alert"
          >
            {logoutError}
          </p>
        )}
        <main id="admin-main" className={styles.main} tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
