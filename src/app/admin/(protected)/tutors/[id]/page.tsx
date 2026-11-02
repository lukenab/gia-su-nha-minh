import Image from "next/image";
import { notFound } from "next/navigation";

import { requireAdminPage } from "@/features/admin-auth/server/guard";
import {
  AvailabilitySelect,
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
  TutorReviewForm,
  type ReviewView,
} from "@/features/admin/components/tutor-review-form";
import { ErrorNotice, StatusBadge } from "@/features/admin/components/ui";
import {
  certificateLabels,
  channelLabels,
  educationLabels,
  experienceLabels,
  labelOf,
  slotLabels,
  teachingAreaLabels,
  tutorFormatLabels,
  tutorLevelLabels,
} from "@/features/admin/labels";
import { connectionsForTutor, getTutor } from "@/features/admin/server/queries";
import {
  missingReviews,
  reviewChecks,
  reviewLabels,
} from "@/features/admin/server/service";
import {
  formatDate,
  formatDateTime,
  formatVnd,
  todayInVietnam,
} from "@/shared/lib/format";
import {
  normalizeStatus,
  statusLabel,
  statusOptions,
  tutorStatuses,
} from "@/shared/lib/workflow";

export const dynamic = "force-dynamic";

const joined = (labels: Record<string, string>, values?: string[]) =>
  (values ?? []).map((value) => labelOf(labels, value)).join(", ");

const reviewHints = {
  identity: "Check an ID document or confirm directly with the tutor.",
  certificates:
    "See the original or an official source for each certificate the tutor listed.",
  experience:
    "Check the teaching experience described (referees, a trial lesson...).",
} as const;

const HELP = {
  ELIGIBLE:
    "All three review steps are recorded. The profile can then be introduced to learners.",
  INELIGIBLE: "Give the reason the profile cannot be introduced.",
};

const isStatus = (value?: string) =>
  (tutorStatuses as readonly string[]).includes(value ?? "");

export default async function TutorApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const actor = await requireAdminPage();
  const { id } = await params;
  let item: Awaited<ReturnType<typeof getTutor>>;
  let connections: Awaited<ReturnType<typeof connectionsForTutor>> = [];
  try {
    item = await getTutor(actor, id);
    if (item) connections = await connectionsForTutor(actor, id);
  } catch {
    return (
      <ErrorNotice>
        Could not load the profile from MongoDB. Please try again later.
      </ErrorNotice>
    );
  }
  if (!item) notFound();

  const now = renderTime();
  const status = normalizeStatus("tutor", item.status);
  const missing = missingReviews(item.reviews);
  const views: ReviewView[] = reviewChecks.map((check) => {
    const step = item.reviews?.[check];
    return {
      check,
      title: reviewLabels[check],
      hint: reviewHints[check],
      reviewed: Boolean(step?.reviewed),
      summary: step?.reviewed
        ? `Reviewed on ${formatDate(step.reviewedAt)} by ${step.reviewedBy || "—"}`
        : "",
      note: step?.note ?? "",
    };
  });
  const options = statusOptions("tutor", status).filter(
    (option) => option.value !== "ELIGIBLE" || missing.length === 0,
  );
  const primary =
    status === "NEW"
      ? "REVIEWING"
      : status === "REVIEWING" && !missing.length
        ? "ELIGIBLE"
        : undefined;
  const accepting =
    typeof item.acceptingStudents === "boolean" ? item.acceptingStudents : null;

  const activity: ActivityItem[] = [
    { kind: "created", at: item.createdAt, text: "Profile submitted" },
    // Tutor history also holds availability changes written as plain text.
    ...(item.statusHistory ?? []).map((entry): ActivityItem =>
      isStatus(entry.to)
        ? {
            kind: "status",
            at: entry.at,
            by: entry.by,
            note: entry.note,
            text: entry.from
              ? `Status: ${statusLabel("tutor", entry.from)} → ${statusLabel("tutor", entry.to)}`
              : `Status set to ${statusLabel("tutor", entry.to)}`,
          }
        : {
            kind: "availability",
            at: entry.at,
            by: entry.by,
            text: `Availability: ${entry.from ? `${entry.from} → ` : ""}${entry.to}`,
          },
    ),
    ...reviewChecks.flatMap((check): ActivityItem[] => {
      const step = item.reviews?.[check];
      return step?.reviewed && step.reviewedAt
        ? [
            {
              kind: "review",
              at: step.reviewedAt,
              by: step.reviewedBy,
              text: `${reviewLabels[check]} reviewed`,
            },
          ]
        : [];
    }),
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
        back={{ href: "/admin/tutors", label: "Tutor profiles" }}
        title={item.fullName}
        code={item.referenceCode}
        meta={
          <>
            Submitted <Ago value={item.createdAt} now={now} />
          </>
        }
        actions={
          <StatusActions
            kind="tutor"
            endpoint={`/api/admin/tutors/${id}/status`}
            current={status}
            options={options}
            primary={primary}
            help={HELP}
            reopenLabel={status === "NEW" ? undefined : "Reopen review"}
          />
        }
      />

      <DetailLayout
        main={
          <>
            <Section
              title="Profile review"
              description="Record each step separately. A submitted form does not mean it is verified."
            >
              <TutorReviewForm
                endpoint={`/api/admin/tutors/${id}/review`}
                views={views}
                today={todayInVietnam()}
                editable={status === "REVIEWING"}
                lockedReason={
                  status === "NEW"
                    ? "Start the review to record these steps."
                    : "Locked. Reopen the review to change these records."
                }
              />
            </Section>

            <Section
              title="Introduction"
              description="Written by the tutor. Internal only; shared with a learner only when the team introduces this tutor."
            >
              <div className={detail.intro}>
                {item.hasPhoto ? (
                  // Served by an admin-only route with the session cookie,
                  // so it is not passed through the image optimiser.
                  <Image
                    unoptimized
                    className={detail.introPhoto}
                    src={`/api/admin/tutors/${id}/photo`}
                    alt={`Profile photo of ${item.fullName}`}
                    width={112}
                    height={112}
                  />
                ) : (
                  <span className={detail.introPhotoEmpty}>No photo yet</span>
                )}
                <div className={detail.introCopy}>
                  {item.headline && <strong>{item.headline}</strong>}
                  <p>
                    {item.experienceNote ||
                      "Not provided yet. Ask for a short introduction and a photo on the first call."}
                  </p>
                </div>
              </div>
            </Section>

            <Section
              title="Teaching profile"
              description="Self-reported by the tutor; not verified until reviewed."
            >
              <Fields
                items={[
                  {
                    label: "Education",
                    value: [
                      item.education
                        ? labelOf(educationLabels, item.education)
                        : "",
                      item.major,
                      item.school,
                    ]
                      .filter(Boolean)
                      .join(" · "),
                  },
                  {
                    label: "Certificates",
                    value: item.certificateList?.length
                      ? item.certificateList
                          .map((cert) =>
                            [
                              cert.type === "other"
                                ? cert.name
                                : labelOf(certificateLabels, cert.type),
                              cert.score,
                              cert.year ? `(${cert.year})` : "",
                            ]
                              .filter(Boolean)
                              .join(" "),
                          )
                          .join("; ")
                      : (item.certificates ?? ""),
                  },
                  {
                    label: "Teaches",
                    value: joined(teachingAreaLabels, item.teachingAreas),
                  },
                  {
                    label: "Learner levels",
                    value: joined(tutorLevelLabels, item.learnerLevels),
                  },
                  {
                    label: "Format",
                    value: labelOf(tutorFormatLabels, item.format),
                  },
                  {
                    label: "Experience",
                    value: labelOf(experienceLabels, item.experience),
                  },
                  {
                    label: "Fee / lesson",
                    value: formatVnd(item.expectedFee) ?? "Negotiable",
                  },
                ]}
              />
              <MoreDetails>
                <Fields
                  items={[
                    ...(item.otherTeachingArea
                      ? [
                          {
                            label: "Other content",
                            value: item.otherTeachingArea,
                          },
                        ]
                      : []),
                    { label: "In-person area", value: item.area ?? "" },
                    {
                      label: "Time slots",
                      value: joined(slotLabels, item.availabilitySlots),
                    },
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
                        {item.phoneHasZalo && <Muted> · Zalo</Muted>}
                        <CopyButton value={item.phone} label="Copy phone" />
                      </span>
                    ) : (
                      ""
                    ),
                  },
                  {
                    label: "Preferred channel",
                    value: labelOf(channelLabels, item.preferredChannel),
                  },
                  {
                    label: "Data consent",
                    value: formatDateTime(item.consentAt),
                  },
                ]}
              />
              <p className={detail.note}>
                Do not share the tutor’s contact details outside the team
                without proper consent.
              </p>
            </Section>

            <Section
              title="Related requests"
              description="Learner requests where this tutor was reviewed or introduced."
            >
              {connections.length ? (
                <div className={list.tableWrap}>
                  <table className={`${list.table} ${list.compact}`}>
                    <thead>
                      <tr>
                        <th scope="col">Learner</th>
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
                              subtitle={connection.requestCode}
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
                <ListEmpty title="No related requests">
                  A tutor appears here once the profile is approved and is
                  chosen from a learner request.
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
                  value: <StatusBadge kind="tutor" status={status} />,
                },
                {
                  label: "Taking learners",
                  value: (
                    <AvailabilitySelect
                      key={String(accepting)}
                      id={id}
                      current={accepting}
                    />
                  ),
                },
                {
                  label: "Review",
                  value: `${reviewChecks.length - missing.length}/${reviewChecks.length} verified`,
                },
              ]}
            />
            <Panel title="Internal note">
              <NoteForm
                key={`${item.internalNoteUpdatedAt ?? "none"}`}
                endpoint={`/api/admin/tutors/${id}/note`}
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
