"use client";

import {
  Blend,
  ExternalLink,
  FileUser,
  IdCard,
  LayoutGrid,
  Menu,
  Moon,
  Settings,
  Sun,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";

import { BrandLockup } from "@/shared/brand/brand-lockup";

import styles from "./admin.module.css";
import { DropdownMenu } from "./dropdown-menu";
import { HeaderSearch } from "./header-search";
import { NotificationMenu } from "./notification-menu";
import { useAdminSummary, type NavCounts } from "./use-admin-summary";
import { useAdminTheme } from "./use-admin-theme";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  badge?: "requests" | "tutors";
};

const GROUPS: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Intake",
    items: [
      {
        href: "/admin",
        label: "Overview",
        icon: LayoutGrid,
        exact: true,
      },
      {
        href: "/admin/requests",
        label: "Learner requests",
        icon: FileUser,
        badge: "requests",
      },
      {
        href: "/admin/tutors",
        label: "Tutor profiles",
        icon: IdCard,
        badge: "tutors",
      },
    ],
  },
  {
    heading: "Matching",
    items: [{ href: "/admin/connections", label: "Connections", icon: Blend }],
  },
];

/** Count badge: requests not yet contacted (red once one is past 24 hours) and new tutor profiles. */
function NavBadge({
  kind,
  counts,
}: {
  kind: "requests" | "tutors";
  counts: NavCounts | null;
}) {
  const count = counts?.[kind] ?? 0;
  if (!count) return null;
  const urgent = kind === "requests" && (counts?.overdue ?? 0) > 0;
  const label =
    kind === "requests"
      ? `${count} not contacted${urgent ? `, ${counts?.overdue} past 24 hours` : ""}`
      : `${count} new`;
  return (
    <span
      className={`${styles.navBadge} ${urgent ? styles.navBadgeUrgent : ""}`}
    >
      <span aria-hidden="true">{count > 99 ? "99+" : count}</span>
      <span className={styles.srOnly}>{label}</span>
    </span>
  );
}

function Navigation({
  onNavigate,
  counts,
}: {
  onNavigate?: () => void;
  counts: NavCounts | null;
}) {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="Admin navigation">
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
                    <Icon aria-hidden="true" strokeWidth={1.75} />
                    <span className={styles.navLabel}>{item.label}</span>
                    {item.badge && (
                      <NavBadge kind={item.badge} counts={counts} />
                    )}
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

function Sidebar({
  onNavigate,
  counts,
}: {
  onNavigate?: () => void;
  counts: NavCounts | null;
}) {
  return (
    <div className={styles.sidebarInner}>
      <div className={styles.brand}>
        <Link
          href="/admin"
          aria-label="Nexus Workspace, admin overview"
          onClick={onNavigate}
        >
          <BrandLockup />
        </Link>
      </div>
      <Navigation onNavigate={onNavigate} counts={counts} />
      <div className={styles.sidebarFoot}>
        <a href="/" target="_blank" rel="noreferrer">
          Open public site <ExternalLink size={13} aria-hidden="true" />
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
  const initials = initialsOf(operator);
  return (
    <DropdownMenu
      label="Account"
      triggerLabel={`Account options for ${operator}`}
      triggerClassName={styles.profileTrigger}
      trigger={
        <span className={styles.avatar} aria-hidden="true">
          {initials}
        </span>
      }
      header={
        <div className={styles.profileSummary}>
          <span className={styles.avatar} aria-hidden="true">
            {initials}
          </span>
          <span className={styles.profileSummaryCopy}>
            <strong>{operator}</strong>
            <span>{email}</span>
          </span>
        </div>
      }
      groups={[
        [
          { label: "Profile", icon: UserRound, href: "/admin/profile" },
          {
            label: "Account settings",
            icon: Settings,
            href: "/admin/settings",
          },
        ],
        [
          {
            label: loggingOut ? "Logging out..." : "Log out",
            tone: "danger",
            onSelect: loggingOut ? undefined : onLogout,
          },
        ],
      ]}
      className={styles.profileDropdown}
    />
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
  const { theme, toggleTheme } = useAdminTheme();
  const summary = useAdminSummary();
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
      setLogoutError("Could not log out. Please try again.");
      setLoggingOut(false);
    }
  }

  return (
    <div className={styles.root} data-theme={theme} lang="en">
      <a className={styles.skip} href="#admin-main">
        Skip to content
      </a>
      <aside className={styles.sidebar} aria-label="Admin sidebar">
        <Sidebar counts={summary.counts} />
      </aside>

      <dialog
        ref={drawerRef}
        className={styles.drawer}
        aria-label="Navigation"
        onClose={() => document.body.style.removeProperty("overflow")}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDrawer();
        }}
      >
        <button
          type="button"
          className={`${styles.iconButton} ${styles.drawerClose}`}
          onClick={closeDrawer}
          aria-label="Close navigation"
        >
          <X size={19} aria-hidden="true" />
        </button>
        <Sidebar onNavigate={closeDrawer} counts={summary.counts} />
      </dialog>

      <div className={styles.body}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              type="button"
              className={`${styles.iconButton} ${styles.menuButton}`}
              aria-label="Open navigation"
              onClick={() => {
                drawerRef.current?.showModal();
                document.body.style.overflow = "hidden";
              }}
            >
              <Menu size={19} aria-hidden="true" />
            </button>
            <Link
              href="/admin"
              className={styles.headerBrand}
              aria-label="Nexus Workspace, admin overview"
            >
              <BrandLockup />
            </Link>
            <Suspense fallback={null}>
              <HeaderSearch />
            </Suspense>
          </div>
          <div className={styles.headerRight}>
            <button
              type="button"
              className={`${styles.iconButton} ${styles.headerControl} ${styles.themeControl}`}
              data-theme={theme}
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <span className={styles.themeGlyph} aria-hidden="true">
                <Sun size={15} className={styles.sun} />
                <Moon size={15} className={styles.moon} />
              </span>
            </button>
            <NotificationMenu summary={summary} />
            <div className={styles.headerSeparator} aria-hidden="true" />
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
