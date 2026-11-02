"use client";

import { Search } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import styles from "./admin.module.css";

/**
 * Searches requests, tutor profiles and connections by code or name. On
 * narrow screens it collapses to an icon that expands over the header.
 */
export function HeaderSearch() {
  const params = useSearchParams();
  // List pages use `q` for their own filter, so only the results page fills it in.
  const query =
    usePathname() === "/admin/search" ? (params.get("q") ?? "") : "";
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expanded) inputRef.current?.focus();
  }, [expanded]);

  return (
    <form
      role="search"
      action="/admin/search"
      method="get"
      className={`${styles.headerSearch} ${expanded ? styles.headerSearchExpanded : ""}`}
    >
      <button
        type="button"
        className={`${styles.iconButton} ${styles.headerSearchToggle}`}
        aria-label="Open search"
        aria-expanded={expanded}
        onClick={() => setExpanded(true)}
      >
        <Search size={18} aria-hidden="true" />
      </button>
      <label className={styles.headerSearchField}>
        <Search size={15} aria-hidden="true" />
        <input
          ref={inputRef}
          key={query}
          type="search"
          name="q"
          defaultValue={query}
          maxLength={60}
          aria-label="Search by code or name"
          placeholder="Search"
          onKeyDown={(event) => {
            if (event.key === "Escape") setExpanded(false);
          }}
          onBlur={() => setExpanded(false)}
        />
      </label>
    </form>
  );
}
