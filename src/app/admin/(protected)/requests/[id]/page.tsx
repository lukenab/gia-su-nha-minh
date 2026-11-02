import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdminPage } from "@/features/admin-auth/server/guard";
import {
  AssigneeSelect,
  CopyButton,
  StatusActions,
} from "@/features/admin/components/detail-controls";
import {
  Activity,
  DetailHeader,
  DetailLayout,
  Fields,
  MoreDetails,
  Muted,
  Panel,
  Properties,
  Section,
  detailStyles as detail,
  type ActivityItem,
} from "@/features/admin/components/detail-view";
import {
  Ago,
  ListEmpty,
  PrimaryCell,
  listStyles as list,
  renderTime,
} from "@/features/admin/components/list-view";
import { NoteForm } from "@/features/admin/components/note-form";
import {
  ErrorNotice,
  SlaBadge,
  StatusBadge,
} from "@/features/admin/components/ui";
import {
  channelLabels,
  concernLabels,
  formatLabels,
  goalLabels,
  labelOf,
  levelLabels,
  slotLabels,
  startLabels,
} from "@/features/admin/labels";
import { listOperators } from "@/features/admin/server/operations";
import {
  connectionsForRequest,
  getRequest,
} from "@/features/admin/server/queries";
import { CONNECTABLE_REQUEST_STATUSES } from "@/features/admin/server/service";
import { formatDateTime, formatVnd } from "@/shared/lib/format";
import {
  normalizeStatus,
  responseSla,
  statusLabel,
  statusOptions,
  suggestRequestStatus,
  type LearnerStatus,
} from "@/shared/lib/workflow";

export const dynamic = "force-dynamic";

/** The usual next step when no connection suggests another one. */
const NEXT: Partial<Record<LearnerStatus, LearnerStatus>> = {
  NEW: "CONTACTED",
  INTRODUCED: "STARTED",
};

const HELP = {
  CONTACTED:
    "Record this only after you have actually contacted the learner. The 24-hour mark is measured at this moment.",
  CLOSED:
    "Closing ends the request. Give the reason, for example the learner found a tutor elsewhere.",
};

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireAdminPage();
  const { id } = await params;
  let item: Awaited<ReturnType<typeof getRequest>>;
  let connections: Awaited<ReturnType<typeof connectionsForRequest>> = [];
  let operators: Awaited<ReturnType<typeof listOperators>> = [];
  try {
    [item, operators] = await Promise.all([
      getRequest(actor, id),
      listOperators(actor),
    ]);
    if (item) connections = await connectionsForRequest(actor, id);
  } catch {
    return (
      <ErrorNotice>
        Could not load the request from MongoDB. Please try again later.
      </ErrorNotice>
    );
  }
  if (!item) notFound();

  const now = renderTime();
  const status = normalizeStatus("learner", item.status);
  const sla = responseSla({
    status,
    createdAt: item.createdAt,
    contactedAt: item.contactedAt,
  });
  const canConnect = CONNECTABLE_REQUEST_STATUSES.includes(status);
  const suggestion = suggestRequestStatus(
    status,
    connections.map((connection) => String(connection.status)),
  );
  const options = statusOptions("learner", status);
  const primary = suggestion?.to ?? NEXT[status];
  const slots = item.availabilitySlots?.length
    ? item.availabilitySlots.map((slot) => labelOf(slotLabels, slot)).join(", ")
    : null;

  const nameOf = (email: string) =>
    operators.find((o) => o.email === email)?.name ?? email;
  const activity: ActivityItem[] = [
    { kind: "created", at: item.createdAt, text: "Request received" },
    ...(item.statusHistory ?? []).map((entry): ActivityItem => ({
      kind: "status",
      at: entry.at,
      by: entry.by,
      note: entry.note,
      text: entry.from
        ? `Status: ${statusLabel("learner", entry.from)} → ${statusLabel("learner", entry.to)}`
        : `Status set to ${statusLabel("learner", entry.to)}`,
    })),
    ...(item.assignmentHistory ?? []).map((entry): ActivityItem => ({
      kind: "assignment",
      at: entry.at,
      by: entry.by,
      text:
        !entry.to || entry.to === "Unassigned"
          ? "Unassigned"
          : `Assigned to ${nameOf(entry.to)}`,
    })),
    ...(item.internalNoteUpdatedAt
      ? [
          {
            kind: "note" as const,
            at: item.internalNoteUpdatedAt,
            by: item.internalNoteUpdatedBy,
            text: "Internal note updated",
          },
        ]
      : []),
  ];

  return (
    <>
      <DetailHeader
        back={{ href: "/admin/requests", label: "Learner requests" }}
        title={item.fullName}
        code={item.referenceCode}
        meta={
          <>
            Received <Ago value={item.createdAt} now={now} />
          </>
        }
        actions={
          <>
            {canConnect && (
              <Link
                className={`${detail.action} ${primary ? "" : detail.actionPrimary}`}
                href={`/admin/requests/${id}/match`}
              >
                Choose a tutor
              </Link>
            )}
            <StatusActions
              kind="learner"
              endpoint={`/api/admin/requests/${id}/status`}
              current={status}
              options={options}
              primary={primary}
              help={HELP}
            />
          </>
        }
      />

      <DetailLayout
        main={
          <>
            <Section title="Learning needs">
              <Fields
                items={[
                  { label: "Goal", value: labelOf(goalLabels, item.goal) },
                  {
                    label: "Level",
                    value: labelOf(levelLabels, item.currentLevel),
                  },
                  {
                    label: "Format",
                    value: labelOf(formatLabels, item.format),
                  },
                  {
                    label: "Budget / lesson",
                    value: formatVnd(item.budgetMax) ?? "",
                  },
                  { label: "Schedule", value: slots ?? item.availability },
                ]}
              />
              <MoreDetails>
                <Fields
                  items={[
                    {
                      label: "Wants to start",
                      value: item.startTime
                        ? labelOf(startLabels, item.startTime)
                        : "",
                    },
                    {
                      label: "Concerns",
                      value: (item.concerns ?? [])
                        .map((value) => labelOf(concernLabels, value))
                        .join(", "),
                    },
                    ...(slots && item.availability !== slots
                      ? [{ label: "Schedule note", value: item.availability }]
                      : []),
                    { label: "Area", value: item.location ?? "" },
                    { label: "Learner's notes", value: item.notes ?? "" },
                  ]}
                />
              </MoreDetails>
            </Section>

            <Section title="Contact">
              <Fields
                items={[
                  {
                    label: "Email",
                    value: item.email ? (
                      <span className={detail.inlineValue}>
                        {item.email}
                        <CopyButton value={item.email} label="Copy email" />
                      </span>
                    ) : (
                      ""
                    ),
                  },
                  {
                    label: "Phone",
                    value: item.phone ? (
                      <span className={detail.inlineValue}>
                        {item.phone}
                        <CopyButton value={item.phone} label="Copy phone" />
                      </span>
                    ) : (
                      ""
                    ),
                  },
                  {
                    label: "Preferred channel",
                    value: item.preferredChannel
                      ? labelOf(channelLabels, item.preferredChannel)
                      : "",
                  },
                  {
                    label: "Data consent",
                    value: formatDateTime(item.consentAt),
                  },
                ]}
              />
              <p className={detail.note}>
                Use this only to handle the request. Do not share it outside the
                team or send it to a tutor without proper consent.
              </p>
            </Section>

            <Section
              title="Tutor connections"
              description={
                canConnect
                  ? "Tutors reviewed or introduced for this request."
                  : status === "NEW"
                    ? "Contact the learner and record “Contacted” before choosing a tutor."
                    : "Requests with this status do not take new connections."
              }
            >
              {connections.length ? (
                <div className={list.tableWrap}>
                  <table className={`${list.table} ${list.compact}`}>
                    <thead>
                      <tr>
                        <th scope="col">Tutor</th>
                        <th scope="col">Status</th>
                        <th scope="col" className={list.end}>
                          Updated
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {connections.map((connection) => (
                        <tr key={String(connection._id)}>
                          <td>
                            <PrimaryCell
                              href={`/admin/connections/${String(connection._id)}`}
                              title={connection.otherName}
                              subtitle={connection.tutorCode}
                            />
                          </td>
                          <td>
                            <StatusBadge
                              kind="connection"
                              status={connection.status}
                            />
                          </td>
                          <td className={list.end}>
                            <Ago value={connection.statusUpdatedAt} now={now} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <ListEmpty title="No tutors recorded yet">
                  The team contacts and introduces people outside this system;
                  it only keeps a record.
                </ListEmpty>
              )}
            </Section>

            <Activity items={activity} now={now} />
          </>
        }
        aside={
          <>
            <Properties
              items={[
                {
                  label: "Status",
                  value: <StatusBadge kind="learner" status={status} />,
                },
                { label: "24-hour mark", value: <SlaBadge sla={sla} /> },
                {
                  label: "Assignee",
                  value: (
                    <AssigneeSelect
                      key={item.assignedTo || "none"}
                      id={id}
                      current={item.assignedTo || ""}
                      operators={operators}
                    />
                  ),
                },
                {
                  label: "Contacted",
                  value: item.contactedAt ? (
                    formatDateTime(item.contactedAt)
                  ) : (
                    <Muted>Not recorded</Muted>
                  ),
                },
              ]}
            />
            {suggestion && (
              <p className={detail.suggestion}>{suggestion.text}</p>
            )}
            <Panel title="Internal note">
              <NoteForm
                key={`${item.internalNoteUpdatedAt ?? "none"}`}
                endpoint={`/api/admin/requests/${id}/note`}
                initial={item.internalNote ?? ""}
                hideLabel
                meta={
                  item.internalNoteUpdatedAt
                    ? `Updated ${formatDateTime(item.internalNoteUpdatedAt)} by ${item.internalNoteUpdatedBy}.`
                    : undefined
                }
              />
            </Panel>
          </>
        }
      />
    </>
  );
}
