import { requireAdminPage } from "@/features/admin-auth/server/guard";
import { ExportButton } from "@/features/admin/components/export-button";
import {
  ListPager,
  ListToolbar,
} from "@/features/admin/components/list-controls";
import {
  Ago,
  Empty,
  ListEmpty,
  ListFrame,
  ListTabs,
  PrimaryCell,
  TwoLine,
  listStyles as list,
  renderTime,
} from "@/features/admin/components/list-view";
import {
  ErrorNotice,
  PageHeader,
  StatusBadge,
  adminStyles,
  hrefWith,
} from "@/features/admin/components/ui";
import {
  countConnectionTabs,
  listConnections,
} from "@/features/admin/server/queries";
import {
  PAGE_SIZE,
  PAGE_SIZES,
  parseConnectionListParams,
} from "@/features/admin/validation";
import { formatVnd } from "@/shared/lib/format";
import { connectionStatuses, statusLabels } from "@/shared/lib/workflow";

export const dynamic = "force-dynamic";

const PATH = "/admin/connections";

const PAYMENT_TABS = [
  { key: "UNPAID", label: "Fee due" },
  { key: "PAID", label: "Paid" },
  { key: "NOT_DUE", label: "Not due" },
] as const;

export default async function ConnectionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await requireAdminPage();
  const params = parseConnectionListParams(await searchParams);
  let data: {
    result: Awaited<ReturnType<typeof listConnections>>;
    counts: Record<string, number>;
  } | null = null;
  try {
    const [result, counts] = await Promise.all([
      listConnections(actor, params),
      countConnectionTabs(actor, params),
    ]);
    data = { result, counts };
  } catch {
    data = null;
  }

  const kept = {
    q: params.q,
    status: params.status,
    confirmed: params.confirmed,
    size: params.size === PAGE_SIZE ? undefined : params.size,
  };
  const filtered = Boolean(params.q || params.status || params.confirmed);
  const now = renderTime();

  return (
    <>
      <PageHeader
        eyebrow="Matching"
        title="Connections"
        description="Tutors reviewed or introduced for each request. To add one, open a contacted learner request and choose a tutor."
        actions={<ExportButton kind="connections" />}
      />
      {!data ? (
        <ErrorNotice>
          Could not load connections from MongoDB. Check the connection and
          reload the page.
        </ErrorNotice>
      ) : (
        <>
          <ListTabs
            label="Connection fee"
            tabs={[
              {
                key: "all",
                label: "All",
                count: data.counts.all ?? 0,
                href: hrefWith(PATH, kept),
                active: !params.payment,
              },
              ...PAYMENT_TABS.map((tab) => ({
                key: tab.key,
                label: tab.label,
                count: data.counts[tab.key] ?? 0,
                href: hrefWith(PATH, kept, { payment: tab.key }),
                active: params.payment === tab.key,
              })),
            ]}
          />
          <ListFrame
            toolbar={
              <ListToolbar
                searchLabel="Search by request or tutor code"
                placeholder="Search request or tutor code"
                clearKeys={["q", "status", "confirmed"]}
                selects={[
                  {
                    name: "status",
                    label: "Status",
                    allLabel: "Any status",
                    options: connectionStatuses.map((value) => ({
                      value,
                      label: statusLabels.connection[value],
                    })),
                  },
                  {
                    name: "confirmed",
                    label: "Agreement",
                    allLabel: "Any agreement",
                    options: [{ value: "1", label: "Both sides agreed" }],
                  },
                ]}
              />
            }
            footer={
              <ListPager
                first={data.result.first}
                last={data.result.last}
                total={data.result.total}
                page={data.result.page}
                pages={data.result.pages}
                size={params.size}
                sizes={PAGE_SIZES}
                noun={["connection", "connections"]}
              />
            }
          >
            {data.result.items.length ? (
              <table className={list.table}>
                <thead>
                  <tr>
                    <th scope="col">Learner</th>
                    <th scope="col">Tutor</th>
                    <th scope="col">Status</th>
                    <th scope="col">Fee</th>
                    <th scope="col" className={list.end}>
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.result.items.map((item) => (
                    <tr key={String(item._id)}>
                      <td>
                        <PrimaryCell
                          href={`${PATH}/${String(item._id)}`}
                          title={item.learnerName}
                          subtitle={item.requestCode}
                        />
                      </td>
                      <td>
                        <TwoLine main={item.tutorName} sub={item.tutorCode} />
                      </td>
                      <td>
                        <StatusBadge kind="connection" status={item.status} />
                      </td>
                      <td>
                        {item.paymentStatus === "PAID" ? (
                          <span className={`${list.dot} ${list.dotGood}`}>
                            Paid · {formatVnd(item.feeAmount ?? 50000)}
                          </span>
                        ) : item.confirmedAt ? (
                          <span
                            className={`${adminStyles.badge} ${adminStyles.toneAttention}`}
                          >
                            Due · {formatVnd(item.feeAmount ?? 50000)}
                          </span>
                        ) : (
                          <Empty>Not due</Empty>
                        )}
                      </td>
                      <td className={list.end}>
                        <TwoLine
                          main={<Ago value={item.statusUpdatedAt} now={now} />}
                          sub={item.statusUpdatedBy}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <ListEmpty
                title={
                  filtered || params.payment
                    ? "No matching connections"
                    : "No connections yet"
                }
              >
                {filtered || params.payment
                  ? "Try another search term, tab or filter."
                  : "Open a contacted request and choose “Choose a tutor” to record the tutors you review."}
              </ListEmpty>
            )}
          </ListFrame>
        </>
      )}
    </>
  );
}
