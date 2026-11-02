import Link from "next/link";

import { requireAdminPage } from "@/features/admin-auth/server/guard";
import {
  Card,
  EmptyState,
  ErrorNotice,
  PageHeader,
  StatusBadge,
  adminStyles as styles,
} from "@/features/admin/components/ui";
import {
  listConnections,
  listRequests,
  listTutors,
} from "@/features/admin/server/queries";
import {
  parseConnectionListParams,
  parseRequestListParams,
  parseTutorListParams,
} from "@/features/admin/validation";
import { formatDate } from "@/shared/lib/format";

export const dynamic = "force-dynamic";

const PREVIEW = 5;

/** Header search: codes and names across requests, tutors and connections. */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await requireAdminPage();
  const raw = await searchParams;
  const q = parseRequestListParams({ q: raw.q }).q;

  if (!q) {
    return (
      <>
        <PageHeader eyebrow="Search" title="Search" />
        <Card>
          <EmptyState title="Type a code or a name">
            Use the search box at the top to find learner requests, tutor
            profiles and connections.
          </EmptyState>
        </Card>
      </>
    );
  }

  let results: [
    Awaited<ReturnType<typeof listRequests>>,
    Awaited<ReturnType<typeof listTutors>>,
    Awaited<ReturnType<typeof listConnections>>,
  ];
  try {
    results = await Promise.all([
      listRequests(actor, parseRequestListParams({ q }), PREVIEW),
      listTutors(actor, parseTutorListParams({ q }), PREVIEW),
      listConnections(actor, parseConnectionListParams({ q }), PREVIEW),
    ]);
  } catch {
    return (
      <>
        <PageHeader eyebrow="Search" title={`Results for “${q}”`} />
        <ErrorNotice>
          Could not search MongoDB. Please try again later.
        </ErrorNotice>
      </>
    );
  }
  const [requests, tutors, connections] = results;
  const query = encodeURIComponent(q);
  const nothing = !requests.total && !tutors.total && !connections.total;

  return (
    <>
      <PageHeader
        eyebrow="Search"
        title={`Results for “${q}”`}
        description="Matches by reference code or name. Open a section to see every result with its filters."
      />
      {nothing ? (
        <Card>
          <EmptyState title="No matches">
            Check the spelling, or search by a code such as GSNM-2026.
          </EmptyState>
        </Card>
      ) : (
        <div className={styles.stack}>
          <Section
            title="Learner requests"
            total={requests.total}
            href={`/admin/requests?q=${query}`}
          >
            {requests.items.map((item) => (
              <li key={String(item._id)}>
                <Link
                  className={styles.tableLink}
                  href={`/admin/requests/${String(item._id)}`}
                >
                  {item.referenceCode}
                </Link>
                <span>{item.fullName}</span>
                <span className={styles.mutedText}>
                  {formatDate(item.createdAt)}
                </span>
                <StatusBadge kind="learner" status={item.status} />
              </li>
            ))}
          </Section>
          <Section
            title="Tutor profiles"
            total={tutors.total}
            href={`/admin/tutors?q=${query}`}
          >
            {tutors.items.map((item) => (
              <li key={String(item._id)}>
                <Link
                  className={styles.tableLink}
                  href={`/admin/tutors/${String(item._id)}`}
                >
                  {item.referenceCode}
                </Link>
                <span>{item.fullName}</span>
                <span className={styles.mutedText}>
                  {formatDate(item.createdAt)}
                </span>
                <StatusBadge kind="tutor" status={item.status} />
              </li>
            ))}
          </Section>
          <Section
            title="Connections"
            total={connections.total}
            href={`/admin/connections?q=${query}`}
          >
            {connections.items.map((item) => (
              <li key={String(item._id)}>
                <Link
                  className={styles.tableLink}
                  href={`/admin/connections/${String(item._id)}`}
                >
                  {item.requestCode} ↔ {item.tutorCode}
                </Link>
                <span>
                  {item.learnerName} · {item.tutorName}
                </span>
                <span className={styles.mutedText}>
                  {formatDate(item.statusUpdatedAt)}
                </span>
                <StatusBadge kind="connection" status={item.status} />
              </li>
            ))}
          </Section>
        </div>
      )}
    </>
  );
}

function Section({
  title,
  total,
  href,
  children,
}: {
  title: string;
  total: number;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      title={`${title} (${total})`}
      action={
        total > PREVIEW ? (
          <Link className={styles.link} href={href}>
            View all {total} →
          </Link>
        ) : undefined
      }
    >
      {total ? (
        <ul className={styles.searchResults}>{children}</ul>
      ) : (
        <p className={styles.mutedText}>No matches.</p>
      )}
    </Card>
  );
}
