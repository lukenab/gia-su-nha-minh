"use client";

import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, type FormEvent } from "react";

import styles from "./list.module.css";

/** The current URL with some parameters changed; any change resets the page. */
function useHrefWith() {
  const pathname = usePathname();
  const params = useSearchParams();
  return (changes: Record<string, string | null>, keepPage = false) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!keepPage) next.delete("page");
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  };
}

export type ToolbarSelect = {
  name: string;
  label: string;
  /** Shown when nothing is chosen, e.g. "All goals". */
  allLabel: string;
  options: { value: string; label: string }[];
};

/**
 * Search and filters for an admin list. Filters apply as soon as they
 * change; the search applies on Enter. Everything lives in the URL, so a
 * filtered list can be shared and the Back button works.
 */
export function ListToolbar({
  searchLabel,
  placeholder,
  selects,
  clearKeys,
}: {
  searchLabel: string;
  placeholder: string;
  selects: ToolbarSelect[];
  /** Parameters the Clear link removes (the status tab and page size stay). */
  clearKeys: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const hrefWith = useHrefWith();
  const [pending, startTransition] = useTransition();
  const query = params.get("q") ?? "";
  const active = clearKeys.some((key) => params.get(key));

  function go(href: string) {
    startTransition(() => router.push(href, { scroll: false }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("q");
    go(hrefWith({ q: typeof value === "string" ? value.trim() : null }));
  }

  return (
    <div className={styles.toolbar} data-pending={pending || undefined}>
      <form role="search" className={styles.search} onSubmit={submit}>
        <Search size={15} aria-hidden="true" />
        <input
          key={query}
          type="search"
          name="q"
          defaultValue={query}
          maxLength={60}
          aria-label={searchLabel}
          placeholder={placeholder}
        />
      </form>
      {selects.map((select) => (
        <select
          key={select.name}
          className={`${styles.filter} ${params.get(select.name) ? styles.filterActive : ""}`}
          aria-label={select.label}
          value={params.get(select.name) ?? ""}
          onChange={(event) =>
            go(hrefWith({ [select.name]: event.target.value || null }))
          }
        >
          <option value="">{select.allLabel}</option>
          {select.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}
      {active && (
        <Link
          className={styles.clear}
          href={hrefWith(
            Object.fromEntries(clearKeys.map((key) => [key, null])),
          )}
          scroll={false}
        >
          <X size={14} aria-hidden="true" />
          Clear
        </Link>
      )}
    </div>
  );
}

/** Table footer: the visible range, rows per page and previous/next. */
export function ListPager({
  first,
  last,
  total,
  page,
  pages,
  size,
  sizes,
  noun,
}: {
  first: number;
  last: number;
  total: number;
  page: number;
  pages: number;
  size: number;
  sizes: readonly number[];
  noun: [singular: string, plural: string];
}) {
  const router = useRouter();
  const hrefWith = useHrefWith();
  const [, startTransition] = useTransition();
  const word = total === 1 ? noun[0] : noun[1];

  return (
    <div className={styles.pager}>
      <p>{total ? `${first}–${last} of ${total} ${word}` : `0 ${noun[1]}`}</p>
      {sizes.length > 1 && (
        <label className={styles.pageSize}>
          Rows per page
          <select
            value={size}
            onChange={(event) =>
              startTransition(() =>
                router.push(
                  hrefWith({
                    size:
                      event.target.value === String(sizes[0])
                        ? null
                        : event.target.value,
                  }),
                  { scroll: false },
                ),
              )
            }
          >
            {sizes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      )}
      <nav className={styles.pageNav} aria-label="Pagination">
        <span>
          Page {page} of {pages}
        </span>
        {page > 1 ? (
          <Link
            href={hrefWith({ page: String(page - 1) }, true)}
            aria-label="Previous page"
            rel="prev"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </Link>
        ) : (
          <span aria-hidden="true" className={styles.pageDisabled}>
            <ChevronLeft size={16} />
          </span>
        )}
        {page < pages ? (
          <Link
            href={hrefWith({ page: String(page + 1) }, true)}
            aria-label="Next page"
            rel="next"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        ) : (
          <span aria-hidden="true" className={styles.pageDisabled}>
            <ChevronRight size={16} />
          </span>
        )}
      </nav>
    </div>
  );
}
