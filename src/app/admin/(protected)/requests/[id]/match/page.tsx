import {
  CircleCheck,
  CircleHelp,
  CircleMinus,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { requireAdminPage } from "@/features/admin-auth/server/guard";
import {
  ConnectForm,
  MatchFilters,
} from "@/features/admin/components/connect-form";
import {
  DetailHeader,
  detailStyles as detail,
} from "@/features/admin/components/detail-view";
import { ListPager } from "@/features/admin/components/list-controls";
import {
  ListEmpty,
  listStyles as list,
} from "@/features/admin/components/list-view";
import { ErrorNotice, StatusBadge } from "@/features/admin/components/ui";
import {
  experienceLabels,
  formatLabels,
  goalLabels,
  labelOf,
  levelLabels,
  slotLabels,
  teachingAreaLabels,
} from "@/features/admin/labels";
import { compareTutor } from "@/features/admin/matching";
import {
  findTutorCandidates,
  getRequest,
} from "@/features/admin/server/queries";
import { CONNECTABLE_REQUEST_STATUSES } from "@/features/admin/server/service";
import { parseMatchParams } from "@/features/admin/validation";
import { formatVnd } from "@/shared/lib/format";
import { normalizeStatus, statusLabel } from "@/shared/lib/workflow";

export const dynamic = "force-dynamic";

const CHECK = {
  match: { label: "Matches", icon: CircleCheck, className: detail.fitMatch },
  mismatch: {
    label: "Differs",
    icon: CircleMinus,
    className: detail.fitMismatch,
  },
  unknown: { label: "Unclear", icon: CircleHelp, className: detail.fitUnknown },
} as const;

export default async function MatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await requireAdminPage();
  const { id } = await params;
  const options = parseMatchParams(await searchParams);

  let request: Awaited<ReturnType<typeof getRequest>>;
  let result: Awaited<ReturnType<typeof findTutorCandidates>> | null = null;
  try {
    request = await getRequest(actor, id);
    if (request) result = await findTutorCandidates(actor, request, options);
  } catch {
    return (
      <ErrorNotice>
        Could not load data from MongoDB. Please try again later.
      </ErrorNotice>
    );
  }
  if (!request || !result) notFound();

  const status = normalizeStatus("learner", request.status);
  const canConnect = CONNECTABLE_REQUEST_STATUSES.includes(status);
  const needs = [
    labelOf(goalLabels, request.goal),
    labelOf(levelLabels, request.currentLevel),
    labelOf(formatLabels, request.format),
    request.availabilitySlots?.length
      ? request.availabilitySlots
          .map((slot) => labelOf(slotLabels, slot))
          .join(", ")
      : request.availability,
    request.budgetMax != null
      ? `Up to ${formatVnd(request.budgetMax)} / lesson`
      : "No budget given",
    request.location,
  ].filter(Boolean);

  return (
    <>
      <DetailHeader
        back={{ href: `/admin/requests/${id}`, label: request.fullName }}
        title="Choose a tutor"
        code={request.referenceCode}
        meta={<StatusBadge kind="learner" status={status} />}
      />

      <section className={detail.needs} aria-label="Learner needs">
        <span className={detail.needsLabel}>Learner needs</span>
        <ul>
          {needs.map((need) => (
            <li key={need}>{need}</li>
          ))}
        </ul>
      </section>

      {!canConnect && (
        <p className={detail.suggestion}>
          The request is “{statusLabel("learner", status)}”, so no tutor can be
          proposed yet.{" "}
          <Link href={`/admin/requests/${id}`}>Back to the request</Link>
        </p>
      )}

      <section className={list.frame}>
        <div className={detail.matchBar}>
          <Suspense fallback={null}>
            <MatchFilters />
          </Suspense>
          <p className={detail.matchCount} aria-live="polite">
            {result.total} of {result.eligibleTotal} approved tutors taking
            learners
          </p>
        </div>
        <p className={detail.matchNote}>
          Always applied: approved, taking learners, right content and format.
          The filters only narrow the list; the team decides who to propose.
        </p>
        {result.items.length ? (
          <ul className={detail.candidates}>
            {result.items.map((tutor) => {
              const checks = compareTutor(
                {
                  goal: request.goal,
                  currentLevel: request.currentLevel,
                  format: request.format,
                  budgetMax: request.budgetMax,
                  availabilitySlots: request.availabilitySlots,
                },
                tutor,
              );
              const existing = result.existing.get(String(tutor._id));
              return (
                <li key={String(tutor._id)} className={detail.candidate}>
                  <div className={detail.candidateMain}>
                    <Link
                      className={detail.candidateName}
                      href={`/admin/tutors/${String(tutor._id)}`}
                      target="_blank"
                    >
                      {tutor.fullName}
                      <ExternalLink size={13} aria-hidden="true" />
                      <span className={detail.srOnly}>
                        (opens in a new tab)
                      </span>
                    </Link>
                    <p className={detail.candidateMeta}>
                      {tutor.referenceCode} ·{" "}
                      {labelOf(experienceLabels, tutor.experience)} ·{" "}
                      {tutor.teachingAreas
                        .map((area) => labelOf(teachingAreaLabels, area))
                        .join(", ")}
                    </p>
                    <ul className={detail.fits} aria-label="Criteria">
                      {checks.map((check) => {
                        const state = CHECK[check.state];
                        const Icon = state.icon;
                        return (
                          <li
                            key={check.key}
                            className={state.className}
                            title={check.detail}
                          >
                            <Icon size={14} aria-hidden="true" />
                            {check.label}
                            <span className={detail.srOnly}>
                              : {state.label}. {check.detail}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div className={detail.candidateAction}>
                    {existing ? (
                      <Link
                        className={detail.action}
                        href={`/admin/connections/${String(existing._id)}`}
                      >
                        {statusLabel("connection", existing.status)} · Open
                      </Link>
                    ) : canConnect ? (
                      <ConnectForm
                        requestId={id}
                        tutorId={String(tutor._id)}
                        tutorName={tutor.fullName}
                      />
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <ListEmpty
            title={
              result.eligibleTotal
                ? "No tutors match these filters"
                : "No approved tutors taking learners yet"
            }
          >
            {result.eligibleTotal
              ? "Turn off some optional criteria, or include mismatches."
              : "Review tutor profiles and approve them before proposing one."}
          </ListEmpty>
        )}
        <ListPager
          first={result.first}
          last={result.last}
          total={result.total}
          page={result.page}
          pages={result.pages}
          size={10}
          sizes={[10]}
          noun={["tutor", "tutors"]}
        />
      </section>
    </>
  );
}
