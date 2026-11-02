"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import {
  LEARNER_REQUEST_HREF,
  navLinks,
  tutorCta,
} from "@/features/landing/content";

import { BrandLogo } from "./brand-logo";
import { ArrowUpRight, Close, Menu } from "./icons";
import styles from "./landing.module.css";

export function LandingHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className={styles.header}>
      <div className={`${styles.shell} ${styles.headerInner}`}>
        <BrandLogo />
        <nav className={styles.navLinks} aria-label="Điều hướng trang chủ">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className={styles.navActions}>
          <Link className={styles.navTutor} href={tutorCta.href}>
            Trở thành gia sư
          </Link>
          <Link className={styles.navCta} href={LEARNER_REQUEST_HREF}>
            Bắt đầu ngay <ArrowUpRight />
          </Link>
        </div>
        <button
          ref={toggle}
          type="button"
          className={styles.menuToggle}
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Đóng menu" : "Mở menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <Close /> : <Menu />}
        </button>
      </div>
      <nav
        id={menuId}
        className={styles.mobileNav}
        data-open={open}
        hidden={!open}
        aria-label="Điều hướng trên điện thoại"
      >
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </Link>
        ))}
        <Link href={tutorCta.href} onClick={() => setOpen(false)}>
          Trở thành gia sư
        </Link>
        <Link
          className={styles.mobileNavCta}
          href={LEARNER_REQUEST_HREF}
          onClick={() => setOpen(false)}
        >
          Match gia sư ngay 🔥 <ArrowUpRight />
        </Link>
      </nav>
    </header>
  );
}
