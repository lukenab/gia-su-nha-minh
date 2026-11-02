import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";

import { requireAdminPage } from "@/features/admin-auth/server/guard";
import {
  AttentionQueue,
  type QueueTab,
} from "@/features/admin/components/attention-queue";
import {
  DemandChart,
  FunnelChart,
  ReplyChart,
} from "@/features/admin/components/overview-charts";
import styles from "@/features/admin/components/overview.module.css";
import { ErrorNotice, PageHeader } from "@/features/admin/components/ui";
import { goalLabels, labelOf } from "@/features/admin/labels";
import { RANGES, parseRange, type RangeKey } from "@/features/admin/overview";
import { getOverview, type Overview } from "@/features/admin/server/overview";
import { formatDate, formatVnd } from "@/shared/lib/format";
import {
  describeSla,
  formatDuration,
  responseSla,
  statusLabel,
} from "@/shared/lib/workflow";

export const dynamic = "force-dynamic";

const RANGE_LABELS: Record<RangeKey, string> = {
  "7d": "7 days",
  "30d": "30 days",
  "90d": "90 days",
};

function RangePicker({ value }: { value: RangeKey }) {
  return (
    <nav className={styles.range} aria-label="Time range">
      {(Object.keys(RANGES) as RangeKey[]).map((key) => (
        <Link
          key={key}
          href={key === "30d" ? "/admin" : `/admin?range=${key}`}
          aria-current={key === value ? "true" : undefined}
          scroll={false}
        >
          {RANGE_LABELS[key]}
        </Link>
      ))}
    </nav>
  );
}

/** Change against the previous period; every KPI here is better when higher. */
function Delta({
  change,
  text,
  period,
}: {
  change: number | null;
  text: string;
  period: string;
}) {
  if (change === null)
    return <span className={styles.deltaMuted}>No earlier data</span>;
  const Icon = change > 0 ? ArrowUpRight : change < 0 ? ArrowDownRight : Minus;
  const tone =
    change > 0
      ? styles.deltaUp
      : change < 0
        ? styles.deltaDown
        : styles.deltaMuted;
  return (
    <span className={tone}>
      <Icon size={14} aria-hidden="true" />
      {change === 0 ? "No change" : text}
      <span className={styles.deltaPeriod}> vs previous {period}</span>
    </span>
  );
}

function Kpis({ data }: { data: Overview }) {
  const { kpis } = data;
  const period = RANGE_LABELS[data.range];
  const rate = kpis.replies.current.rate;
  const previousRate = kpis.replies.previous.rate;
  const ratePoints =
    rate !== null && previousRate !== null
      ? Math.round((rate - previousRate) * 100)
      : null;
  const confirmedChange = kpis.confirmed.current - kpis.confirmed.previous;
  const revenueChange = kpis.revenue.current - kpis.revenue.previous;

  return (
    <section className={styles.kpis} aria-label="Key figures">
      <Link href="/admin/requests?status=NEW" className={styles.kpi}>
        <span className={styles.kpiLabel}>Waiting for contact</span>
        <strong className={styles.kpiValue}>{kpis.waiting}</strong>
        {kpis.overdue ? (
          <span className={styles.deltaDown}>
            <TriangleAlert size={14} aria-hidden="true" />
            {kpis.overdue} past 24 hours
          </span>
        ) : (
          <span className={styles.deltaMuted}>None past 24 hours</span>
        )}
      </Link>
      <div className={styles.kpi}>
        <span className={styles.kpiLabel}>Replies within 24 hours</span>
        <strong className={styles.kpiValue}>
          {rate === null ? "—" : `${Math.round(rate * 100)}%`}
        </strong>
        {rate === null ? (
          <span className={styles.deltaMuted}>No contacts in this period</span>
        ) : (
          <Delta
            change={ratePoints}
            text={`${ratePoints! > 0 ? "+" : ""}${ratePoints} pts`}
            period={period}
          />
        )}
      </div>
      <Link href="/admin/connections?confirmed=1" className={styles.kpi}>
        <span className={styles.kpiLabel}>Connections confirmed</span>
        <strong className={styles.kpiValue}>{kpis.confirmed.current}</strong>
        <Delta
          change={confirmedChange}
          text={`${confirmedChange > 0 ? "+" : ""}${confirmedChange}`}
          period={period}
        />
      </Link>
      <Link href="/admin/connections?payment=PAID" className={styles.kpi}>
        <span className={styles.kpiLabel}>Revenue received</span>
        <strong className={styles.kpiValue}>
          {formatVnd(kpis.revenue.current)}
        </strong>
        <Delta
          change={revenueChange}
          text={`${revenueChange > 0 ? "+" : "−"}${formatVnd(Math.abs(revenueChange))}`}
          period={period}
        />
      </Link>
    </section>
  );
}

function queueTabs(data: Overview): QueueTab[] {
  const { contact, review, fees } = data.queues;
  return [
    {
      key: "contact",
      label: "Contact learners",
      total: contact.total,
      viewAll: "/admin/requests?status=NEW",
      empty: "Every learner request has been contacted.",
      rows: contact.items.map((item) => {
        const sla = responseSla({ status: "NEW", createdAt: item.at });
        return {
          id: item.id,
          href: item.href,
          code: item.code,
          name: item.name,
          meta: `${labelOf(goalLabels, item.detail)} · received ${formatDate(item.at)}`,
          badge: {
            text: describeSla(sla),
            tone: sla.kind === "overdue" ? "danger" : "warn",
          },
        };
      }),
    },
    {
      key: "review",
      label: "Review tutors",
      total: review.total,
      viewAll: "/admin/tutors?status=REVIEWING",
      empty: "No tutor profiles are waiting for review.",
      rows: review.items.map((item) => ({
        id: item.id,
        href: item.href,
        code: item.code,
        name: item.name,
        meta: `Submitted ${formatDate(item.at)}`,
        badge: { text: statusLabel("tutor", item.detail), tone: "muted" },
      })),
    },
    {
      key: "fees",
      label: "Collect fees",
      total: fees.total,
      viewAll: "/admin/connections?payment=UNPAID",
      empty: "No confirmed connection is waiting for its fee.",
      rows: fees.items.map((item) => ({
        id: item.id,
        href: item.href,
        code: item.code,
        name: item.name,
        meta: `Both sides agreed ${formatDate(item.at)}`,
        badge: {
          text: `${formatDuration(Date.now() - new Date(item.at).getTime())} ago`,
          tone: "muted",
        },
      })),
    },
  ];
}

function Panel({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`${styles.panel} ${className}`}>
      <header className={styles.panelHead}>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </header>
      {children}
    </section>
  );
}

export default async function AdminHomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await requireAdminPage();
  const range = parseRange((await searchParams).range);
  let data: Overview | null = null;
  try {
    data = await getOverview(actor, range);
  } catch {
    data = null;
  }

  return (
    <>
      <PageHeader
        eyebrow="Intake"
        title="Overview"
        description="What needs the team today, and how matching is going."
        actions={<RangePicker value={range} />}
      />
      {!data ? (
        <ErrorNotice>
          Could not connect to MongoDB. Check the configuration and the database
          status, then reload the page.
        </ErrorNotice>
      ) : (
        <div className={styles.overview}>
          <Kpis data={data} />
          <div className={styles.grid}>
            <div className={styles.side}>
              <Panel
                title="Needs attention"
                description="Oldest first. Open an item to handle it."
              >
                <AttentionQueue tabs={queueTabs(data)} />
              </Panel>
              <Panel
                title="Requests and reply time"
                description={`Requests received per ${range === "90d" ? "week" : "day"}, by how fast the team made contact.`}
              >
                <ReplyChart
                  buckets={data.replies}
                  unit={range === "90d" ? "week" : "day"}
                />
              </Panel>
            </div>
            <div className={styles.side}>
              <Panel
                title="Matching funnel"
                description={`Requests received in the last ${RANGE_LABELS[range]}.`}
              >
                <FunnelChart stages={data.funnel} />
              </Panel>
              <Panel
                title="Demand vs available tutors"
                description="Open requests by goal against approved tutors taking learners, right now."
              >
                <DemandChart rows={data.demand} />
              </Panel>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
