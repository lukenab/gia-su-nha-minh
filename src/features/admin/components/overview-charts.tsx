/*
 * Charts for the admin overview, drawn with plain HTML and CSS so they follow
 * the admin theme with no chart library. Each mark is focusable and shows its
 * values on hover or focus, and each chart has a data table for screen
 * readers and for anyone who prefers numbers.
 */
import type { DemandRow, FunnelStage, ReplyBucket } from "../overview";

import { goalLabels, labelOf } from "../labels";
import styles from "./overview.module.css";

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

function niceMax(value: number) {
  if (value <= 4) return 4;
  const step = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / step) * step;
}

function DataTable({
  caption,
  head,
  rows,
}: {
  caption: string;
  head: string[];
  rows: (string | number)[][];
}) {
  return (
    <details className={styles.dataTable}>
      <summary>Show data</summary>
      <table>
        <caption className={styles.srOnly}>{caption}</caption>
        <thead>
          <tr>
            {head.map((cell) => (
              <th key={cell} scope="col">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={String(row[0])}>
              {row.map((cell, index) => (
                <td key={index}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

function Legend({ items }: { items: { label: string; className: string }[] }) {
  return (
    <ul className={styles.legend}>
      {items.map((item) => (
        <li key={item.label}>
          <span className={`${styles.swatch} ${item.className}`} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

/* --------------------------- reply chart --------------------------- */

const SEGMENTS = [
  { key: "onTime", label: "Contacted within 24h", className: styles.onTime },
  { key: "late", label: "Contacted later", className: styles.late },
  { key: "notContacted", label: "Not contacted", className: styles.pending },
] as const;

export function ReplyChart({
  buckets,
  unit,
}: {
  buckets: ReplyBucket[];
  unit: "day" | "week";
}) {
  const totals = buckets.map((b) => b.onTime + b.late + b.notContacted);
  const max = niceMax(Math.max(0, ...totals));
  // Keep about six readable dates under the bars.
  const every = Math.max(1, Math.ceil(buckets.length / 6));
  const received = totals.reduce((sum, n) => sum + n, 0);

  return (
    <figure className={styles.figure}>
      <Legend items={[...SEGMENTS]} />
      <div
        className={styles.columns}
        role="list"
        aria-label="Requests received"
      >
        <div className={styles.yAxis} aria-hidden="true">
          <span>{max}</span>
          <span>{max / 2}</span>
          <span>0</span>
        </div>
        <div className={styles.plot}>
          {buckets.map((bucket, index) => {
            const total = totals[index]!;
            const prefix = unit === "week" ? "Week of " : "";
            const summary = `${prefix}${bucket.label}: ${plural(total, "request")}, ${bucket.onTime} within 24h, ${bucket.late} later, ${bucket.notContacted} not contacted`;
            return (
              <div
                key={bucket.start}
                className={styles.column}
                role="listitem"
                tabIndex={0}
                aria-label={summary}
              >
                <div
                  className={styles.stack}
                  style={{ height: `${(total / max) * 100}%` }}
                >
                  {SEGMENTS.map((segment) =>
                    bucket[segment.key] ? (
                      <span
                        key={segment.key}
                        className={segment.className}
                        style={{ flexGrow: bucket[segment.key] }}
                      />
                    ) : null,
                  )}
                </div>
                <span className={styles.tip} aria-hidden="true">
                  <strong>
                    {prefix}
                    {bucket.label} · {plural(total, "request")}
                  </strong>
                  {SEGMENTS.map((segment) => (
                    <span key={segment.key}>
                      <i className={`${styles.swatch} ${segment.className}`} />
                      {segment.label}: {bucket[segment.key]}
                    </span>
                  ))}
                </span>
                <span className={styles.xLabel} aria-hidden="true">
                  {index % every === 0 || index === buckets.length - 1
                    ? bucket.label
                    : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {!received && (
        <p className={styles.chartEmpty}>No requests in this period.</p>
      )}
      <DataTable
        caption="Requests received and how fast they were contacted"
        head={[
          unit === "week" ? "Week of" : "Day",
          ...SEGMENTS.map((s) => s.label),
        ]}
        rows={buckets.map((b) => [b.label, b.onTime, b.late, b.notContacted])}
      />
    </figure>
  );
}

/* ----------------------------- funnel ----------------------------- */

export function FunnelChart({ stages }: { stages: FunnelStage[] }) {
  const first = stages[0]?.count ?? 0;
  return (
    <figure className={styles.figure}>
      <ol className={styles.funnel}>
        {stages.map((stage) => {
          const share = first ? stage.count / first : 0;
          const percent = first ? `${Math.round(share * 100)}%` : "—";
          return (
            <li key={stage.key} tabIndex={0}>
              <span className={styles.funnelLabel}>{stage.label}</span>
              <span className={styles.track}>
                <span
                  className={styles.funnelBar}
                  style={{
                    width: `${Math.max(share * 100, stage.count ? 2 : 0)}%`,
                  }}
                />
              </span>
              <span className={styles.funnelValue}>
                <strong>{stage.count}</strong>
                <span>{percent}</span>
              </span>
            </li>
          );
        })}
      </ol>
      <DataTable
        caption="Matching funnel"
        head={["Stage", "Requests", "Share of received"]}
        rows={stages.map((s) => [
          s.label,
          s.count,
          first ? `${Math.round((s.count / first) * 100)}%` : "—",
        ])}
      />
    </figure>
  );
}

/* ------------------------- demand vs tutors ------------------------- */

export function DemandChart({ rows }: { rows: DemandRow[] }) {
  const max = niceMax(
    Math.max(0, ...rows.flatMap((r) => [r.requests, r.tutors])),
  );
  // Goals with neither open requests nor tutors only add noise.
  const shown = rows.filter((row) => row.requests || row.tutors);
  const hidden = rows.length - shown.length;
  return (
    <figure className={styles.figure}>
      <Legend
        items={[
          { label: "Open requests", className: styles.onTime },
          { label: "Available tutors", className: styles.late },
        ]}
      />
      {!shown.length && (
        <p className={styles.queueEmpty}>
          No open requests and no available tutors yet.
        </p>
      )}
      <ul className={styles.demand}>
        {shown.map((row) => {
          const short = row.requests > row.tutors;
          const label = labelOf(goalLabels, row.goal);
          return (
            <li
              key={row.goal}
              tabIndex={0}
              aria-label={`${label}: ${plural(row.requests, "open request")}, ${plural(row.tutors, "available tutor")}${short ? ", short of tutors" : ""}`}
            >
              <span className={styles.demandLabel}>
                {label}
                {short && (
                  <span className={styles.shortage}>
                    <span aria-hidden="true">▲</span> Short of tutors
                  </span>
                )}
              </span>
              <span className={styles.pair} aria-hidden="true">
                <span className={styles.pairRow}>
                  <span className={styles.track}>
                    <span
                      className={`${styles.pairBar} ${styles.onTime}`}
                      style={{ width: `${(row.requests / max) * 100}%` }}
                    />
                  </span>
                  <span className={styles.pairValue}>{row.requests}</span>
                </span>
                <span className={styles.pairRow}>
                  <span className={styles.track}>
                    <span
                      className={`${styles.pairBar} ${styles.late}`}
                      style={{ width: `${(row.tutors / max) * 100}%` }}
                    />
                  </span>
                  <span className={styles.pairValue}>{row.tutors}</span>
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      {hidden > 0 && shown.length > 0 && (
        <p className={styles.chartNote}>
          {hidden} other {hidden === 1 ? "goal has" : "goals have"} no open
          requests or tutors.
        </p>
      )}
      <DataTable
        caption="Open requests and available tutors by goal"
        head={["Goal", "Open requests", "Available tutors"]}
        rows={rows.map((r) => [
          labelOf(goalLabels, r.goal),
          r.requests,
          r.tutors,
        ])}
      />
    </figure>
  );
}
