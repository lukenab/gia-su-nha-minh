import Link from "next/link";

import { requireAdminPage } from "@/features/admin-auth/server/guard";
import { ExportButton } from "@/features/admin/components/export-button";
import {
  ListPager,
  ListToolbar,
} from "@/features/admin/components/list-controls";
import {
  Ago,
  Empty,
  Initials,
  ListEmpty,
  ListFrame,
  ListTabs,
  PrimaryCell,
  listStyles as list,
  renderTime,
} from "@/features/admin/components/list-view";
import {
  ErrorNotice,
  PageHeader,
  RequestStatus,
  hrefWith,
} from "@/features/admin/components/ui";
import { formatLabels, goalLabels, labelOf } from "@/features/admin/labels";
import { listOperators } from "@/features/admin/server/operations";
import {
  countRequestTabs,
  listRequests,
} from "@/features/admin/server/queries";
import {
  PAGE_SIZE,
  PAGE_SIZES,
  REQUEST_STAGES,
  parseRequestListParams,
  type RequestStage,
} from "@/features/admin/validation";
import { learnerStatuses, statusLabels } from "@/shared/lib/workflow";

export const dynamic = "force-dynamic";

const PATH = "/admin/requests";
const toOptions = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

const STAGE_TABS: { key: RequestStage; label: string }[] = [
  { key: "new", label: "Needs contact" },
  { key: "active", label: "In progress" },
  { key: "learning", label: "Learning" },
  { key: "closed", label: "Closed" },
];

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await requireAdminPage();
  const params = parseRequestListParams(await searchParams);
  let data: {
    result: Awaited<ReturnType<typeof listRequests>>;
    counts: Record<string, number>;
    operators: Awaited<ReturnType<typeof listOperators>>;
  } | null = null;
  try {
    const [result, counts, operators] = await Promise.all([
      listRequests(actor, params),
      countRequestTabs(actor, params),
      listOperators(actor),
    ]);
    data = { result, counts, operators };
  } catch {
    data = null;
  }

  // Tabs group statuses; switching tab keeps the other filters.
  const kept = {
    q: params.q,
    assignedTo: params.assignedTo,
    goal: params.goal,
    format: params.format,
    size: params.size === PAGE_SIZE ? undefined : params.size,
  };
  const exact = params.overdue ? "NEW" : params.status;
  const activeStage =
    params.stage ??
    STAGE_TABS.find((tab) =>
      (REQUEST_STAGES[tab.key] as readonly string[]).includes(exact ?? ""),
    )?.key;
  const filtered = Boolean(
    params.q || params.assignedTo || params.goal || params.format || exact,
  );
  const now = renderTime();
  const stageCount = (stage: RequestStage) =>
    REQUEST_STAGES[stage].reduce(
      (sum, status) => sum + (data?.counts[status] ?? 0),
      0,
    );

  return (
    <>
      <PageHeader
        eyebrow="Intake"
        title="Learner requests"
        description="Requests sent from the learner form. Open one to contact the learner and find a tutor."
        actions={<ExportButton kind="requests" />}
      />
      {!data ? (
        <ErrorNotice>
          Could not load requests from MongoDB. Check the connection and reload
          the page.
        </ErrorNotice>
      ) : (
        <>
          <ListTabs
            label="Request stage"
            tabs={[
              {
                key: "all",
                label: "All",
                count: data.counts.all ?? 0,
                href: hrefWith(PATH, kept),
                active: !activeStage,
              },
              ...STAGE_TABS.map((tab) => ({
                key: tab.key,
                label: tab.label,
                count: stageCount(tab.key),
                href: hrefWith(PATH, kept, { stage: tab.key }),
                active: activeStage === tab.key,
              })),
            ]}
          />
          <ListFrame
            toolbar={
              <ListToolbar
                searchLabel="Search by code or name"
                placeholder="Search code or name"
                clearKeys={["q", "status", "assignedTo", "goal", "format"]}
                selects={[
                  {
                    name: "status",
                    label: "Status",
                    allLabel: "Any status",
                    options: learnerStatuses.map((value) => ({
                      value,
                      label: statusLabels.learner[value],
                    })),
                  },
                  {
                    name: "assignedTo",
                    label: "Assignee",
                    allLabel: "Any assignee",
                    options: data.operators.map((o) => ({
                      value: o.email,
                      label: o.name,
                    })),
                  },
                  {
                    name: "goal",
                    label: "Goal",
                    allLabel: "Any goal",
                    options: toOptions(goalLabels),
                  },
                  {
                    name: "format",
                    label: "Format",
                    allLabel: "Any format",
                    options: toOptions(formatLabels),
                  },
                ]}
              />
            }
            notice={
              params.overdue && (
                <p className={list.notice}>
                  Showing requests not contacted after more than 24 hours.
                  <Link href={hrefWith(PATH, kept, { stage: "new" })}>
                    Show all that need contact
                  </Link>
                </p>
              )
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
                noun={["request", "requests"]}
              />
            }
          >
            {data.result.items.length ? (
              <table className={list.table}>
                <thead>
                  <tr>
                    <th scope="col">Learner</th>
                    <th scope="col">Goal</th>
                    <th scope="col">Status</th>
                    <th scope="col">Assignee</th>
                    <th scope="col" className={list.end}>
                      Received
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.result.items.map((item) => {
                    const assignee = data.operators.find(
                      (o) => o.email === item.assignedTo,
                    );
                    return (
                      <tr key={String(item._id)}>
                        <td>
                          <PrimaryCell
                            href={`${PATH}/${String(item._id)}`}
                            title={item.fullName}
                            subtitle={item.referenceCode}
                          />
                        </td>
                        <td>{labelOf(goalLabels, item.goal)}</td>
                        <td>
                          <RequestStatus
                            status={item.status}
                            createdAt={item.createdAt}
                            contactedAt={item.contactedAt}
                          />
                        </td>
                        <td>
                          {item.assignedTo ? (
                            <span className={list.person}>
                              <Initials
                                name={assignee?.name ?? item.assignedTo}
                              />
                              {assignee?.name ?? item.assignedTo}
                            </span>
                          ) : (
                            <Empty>Unassigned</Empty>
                          )}
                        </td>
                        <td className={list.end}>
                          <Ago value={item.createdAt} now={now} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <ListEmpty
                title={
                  filtered || activeStage
                    ? "No matching requests"
                    : "No requests yet"
                }
              >
                {filtered || activeStage
                  ? "Try another search term, tab or filter."
                  : "Requests appear here when learners send the form."}
              </ListEmpty>
            )}
          </ListFrame>
        </>
      )}
    </>
  );
}
