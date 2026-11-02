import { Ban } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdminPage } from "@/features/admin-auth/server/guard";
import { StatusActions } from "@/features/admin/components/detail-controls";
import {
  Activity,
  DetailHeader,
  DetailLayout,
  Fields,
  Muted,
  Properties,
  Section,
  detailStyles as detail,
  type ActivityItem,
} from "@/features/admin/components/detail-view";
import { Ago, renderTime } from "@/features/admin/components/list-view";
import {
  AgreementPanel,
  FeePanel,
} from "@/features/admin/components/operation-forms";
import {
  ErrorNotice,
  StatusBadge,
  adminStyles as styles,
} from "@/features/admin/components/ui";
import {
  formatLabels,
  goalLabels,
  labelOf,
  levelLabels,
  slotLabels,
  teachingAreaLabels,
  tutorFormatLabels,
} from "@/features/admin/labels";
import { compareTutor } from "@/features/admin/matching";
import {
  connectionsForRequest,
  getConnection,
} from "@/features/admin/server/queries";
import { formatVnd } from "@/shared/lib/format";
import {
  connectionStatuses,
  normalizeStatus,
  statusLabel,
  statusOptions,
  suggestRequestStatus,
  type ConnectionStatus,
} from "@/shared/lib/workflow";

export const dynamic = "force-dynamic";

const stateLabel = {
  match: "Matches",
  mismatch: "Differs",
  unknown: "Unclear",
} as const;

const STEPS: { status: ConnectionStatus; label: string }[] = [
  { status: "REVIEWING", label: "Proposed" },
  { status: "INTRODUCED", label: "Introduced" },
  { status: "CONFIRMED", label: "Agreed" },
  { status: "STARTED", label: "Learning" },
];

const NEXT: Partial<Record<ConnectionStatus, ConnectionStatus>> = {
  REVIEWING: "INTRODUCED",
  CONFIRMED: "STARTED",
};

const HELP = {
  INTRODUCED:
    "Record this after the team has introduced the tutor to the learner. The system does not send messages or emails to anyone.",
  STARTED: "Record that lessons have started between the learner and tutor.",
  DECLINED:
    "Give the reason the connection is not continuing. Recorded agreements are cleared.",
};

const isStatus = (value?: string) =>
  (connectionStatuses as readonly string[]).includes(value ?? "");

export default async function ConnectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireAdminPage();
  const { id } = await params;
  let data: Awaited<ReturnType<typeof getConnection>>;
  let siblings: Awaited<ReturnType<typeof connectionsForRequest>> = [];
  try {
    data = await getConnection(actor, id);
    if (data)
      siblings = await connectionsForRequest(
        actor,
        String(data.connection.request),
      );
  } catch {
    return (
      <ErrorNotice>
        Could not load the connection from MongoDB. Please try again later.
      </ErrorNotice>
    );
  }
  if (!data) notFound();

  const now = renderTime();
  const { connection, request, tutor } = data;
  const status = normalizeStatus("connection", connection.status);
  const tutorStatus = tutor ? normalizeStatus("tutor", tutor.status) : null;
  const requestStatus = request
    ? normalizeStatus("learner", request.status)
    : null;
  const suggestion = requestStatus
    ? suggestRequestStatus(
        requestStatus,
        siblings.map((item) => String(item.status)),
      )
    : null;
  const checks =
    request && tutor
      ? compareTutor(
          {
            goal: request.goal,
            currentLevel: request.currentLevel,
            format: request.format,
            budgetMax: request.budgetMax,
            availabilitySlots: request.availabilitySlots,
          },
          tutor,
        )
      : [];
  const stepIndex = STEPS.findIndex((step) => step.status === status);
  const agreed =
    Number(Boolean(connection.learnerConfirmedAt)) +
    Number(Boolean(connection.tutorConfirmedAt));
  const fee =
    connection.paymentStatus === "PAID"
      ? "Paid"
      : connection.confirmedAt
        ? "Due"
        : "Not due";
  const learnerName = request?.fullName ?? connection.requestCode;
  const tutorName = tutor?.fullName ?? connection.tutorCode;
  const iso = (value?: Date | string | null) =>
    value ? new Date(value).toISOString() : null;

  const activity: ActivityItem[] = [
    {
      kind: "created",
      at: connection.createdAt,
      by: connection.createdBy,
      text: "Connection recorded",
    },
    ...(connection.history ?? [])
      .filter((entry) => entry.from)
      .map((entry): ActivityItem => ({
        kind: "status",
        at: entry.at,
        by: entry.by,
        note: entry.note,
        text: `Status: ${statusLabel("connection", entry.from)} → ${statusLabel("connection", entry.to)}`,
      })),
    ...(connection.operationsHistory ?? []).map((entry): ActivityItem => ({
      kind:
        entry.to.includes("agreed") || entry.from === "Not confirmed"
          ? "agreement"
          : "payment",
      at: entry.at,
      by: entry.by,
      note: entry.note,
      text: isStatus(entry.to) ? statusLabel("connection", entry.to) : entry.to,
    })),
  ];

  return (
    <>
      <DetailHeader
        back={{ href: "/admin/connections", label: "Connections" }}
        title={`${learnerName} ↔ ${tutorName}`}
        code={`${connection.requestCode} ↔ ${connection.tutorCode}`}
        meta={
          <>
            Recorded <Ago value={connection.createdAt} now={now} />
          </>
        }
        actions={
          <StatusActions
            kind="connection"
            endpoint={`/api/admin/connections/${id}/status`}
            current={status}
            options={statusOptions("connection", status)}
            primary={NEXT[status]}
            help={HELP}
          />
        }
      />

      <DetailLayout
        main={
          <>
            <Section title="Progress">
              {status === "DECLINED" ? (
                <p className={detail.declined}>
                  <Ban size={15} aria-hidden="true" />
                  Ended. Reopen it to use this connection again.
                </p>
              ) : (
                <ol className={detail.stepper} aria-label="Connection progress">
                  {STEPS.map((step, index) => (
                    <li
                      key={step.status}
                      className={
                        index < stepIndex
                          ? detail.stepDone
                          : index === stepIndex
                            ? detail.stepCurrent
                            : undefined
                      }
                      aria-current={index === stepIndex ? "step" : undefined}
                    >
                      {step.label}
                    </li>
                  ))}
                </ol>
              )}
              <div className={detail.blocks}>
                <AgreementPanel
                  key={`${connection.operationsRevision || 0}-agreement`}
                  id={id}
                  revision={connection.operationsRevision || 0}
                  learnerAt={iso(connection.learnerConfirmedAt)}
                  tutorAt={iso(connection.tutorConfirmedAt)}
                  status={status}
                />
                <FeePanel
                  key={`${connection.operationsRevision || 0}-fee`}
                  id={id}
                  revision={connection.operationsRevision || 0}
                  status={connection.paymentStatus || "NOT_DUE"}
                  confirmedAt={iso(connection.confirmedAt)}
                  paidAt={iso(connection.paidAt)}
                  method={connection.paymentMethod || ""}
                  reference={connection.paymentReference || ""}
                  amount={connection.feeAmount ?? 50000}
                />
              </div>
            </Section>

            <Section
              title="Learner and tutor"
              description="Side by side, for reference. This is not a match score and does not decide the connection."
            >
              <div className={detail.compare}>
                <div>
                  <div className={detail.compareHead}>
                    <h3>Learner</h3>
                    {request && (
                      <Link href={`/admin/requests/${String(request._id)}`}>
                        Open request →
                      </Link>
                    )}
                  </div>
                  {request ? (
                    <Fields
                      items={[
                        { label: "Name", value: request.fullName },
                        {
                          label: "Goal",
                          value: labelOf(goalLabels, request.goal),
                        },
                        {
                          label: "Level",
                          value: labelOf(levelLabels, request.currentLevel),
                        },
                        {
                          label: "Format",
                          value: labelOf(formatLabels, request.format),
                        },
                        {
                          label: "Schedule",
                          value: request.availabilitySlots?.length
                            ? request.availabilitySlots
                                .map((slot) => labelOf(slotLabels, slot))
                                .join(", ")
                            : request.availability,
                        },
                        {
                          label: "Budget",
                          value: formatVnd(request.budgetMax) ?? "",
                        },
                      ]}
                    />
                  ) : (
                    <Muted>The original request was not found.</Muted>
                  )}
                </div>
                <div>
                  <div className={detail.compareHead}>
                    <h3>Tutor</h3>
                    {tutor && (
                      <Link href={`/admin/tutors/${String(tutor._id)}`}>
                        Open profile →
                      </Link>
                    )}
                  </div>
                  {tutor ? (
                    <Fields
                      items={[
                        { label: "Name", value: tutor.fullName },
                        {
                          label: "Teaches",
                          value: tutor.teachingAreas
                            .map((area) => labelOf(teachingAreaLabels, area))
                            .join(", "),
                        },
                        {
                          label: "Format",
                          value: labelOf(tutorFormatLabels, tutor.format),
                        },
                        {
                          label: "Time slots",
                          value: tutor.availabilitySlots
                            .map((slot) => labelOf(slotLabels, slot))
                            .join(", "),
                        },
                        {
                          label: "Expected fee",
                          value: formatVnd(tutor.expectedFee) ?? "Negotiable",
                        },
                      ]}
                    />
                  ) : (
                    <Muted>The tutor profile was not found.</Muted>
                  )}
                </div>
              </div>
              {checks.length > 0 && (
                <ul className={styles.checks}>
                  {checks.map((check) => (
                    <li
                      key={check.key}
                      className={`${styles.check} ${check.state === "match" ? styles.checkMatch : check.state === "mismatch" ? styles.checkMismatch : ""}`}
                    >
                      <strong>
                        {check.label}
                        <span>{stateLabel[check.state]}</span>
                      </strong>
                      <small>{check.detail}</small>
                    </li>
                  ))}
                </ul>
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
                  value: <StatusBadge kind="connection" status={status} />,
                },
                { label: "Agreement", value: `${agreed}/2 confirmed` },
                { label: "Fee", value: fee },
                {
                  label: "Updated",
                  value: (
                    <>
                      <Ago value={connection.statusUpdatedAt} now={now} />
                      <Muted> · {connection.statusUpdatedBy}</Muted>
                    </>
                  ),
                },
                { label: "Recorded by", value: connection.createdBy },
              ]}
            />
            {suggestion && request && (
              <p className={detail.suggestion}>
                {suggestion.text} You can move the request to “
                {statusLabel("learner", suggestion.to)}”.
                <Link href={`/admin/requests/${String(request._id)}`}>
                  Open request →
                </Link>
              </p>
            )}
            {tutorStatus && tutorStatus !== "ELIGIBLE" && (
              <p className={detail.suggestion}>
                The tutor profile is now “{statusLabel("tutor", tutorStatus)}”
                and can no longer be introduced.
              </p>
            )}
          </>
        }
      />
    </>
  );
}
