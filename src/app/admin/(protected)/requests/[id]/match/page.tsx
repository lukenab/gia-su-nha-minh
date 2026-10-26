import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdminPage } from "@/features/admin-auth/server/guard";
import { ConnectForm } from "@/features/admin/components/connect-form";
import {
  Card,
  DefList,
  EmptyState,
  ErrorNotice,
  PageHeader,
  Pagination,
  StatusBadge,
  adminStyles as styles,
} from "@/features/admin/components/ui";
import { compareTutor } from "@/features/admin/matching";
import {
  findTutorCandidates,
  getRequest,
} from "@/features/admin/server/queries";
import { CONNECTABLE_REQUEST_STATUSES } from "@/features/admin/server/service";
import { parseMatchParams } from "@/features/admin/validation";
import { formatVnd } from "@/shared/lib/format";
import {
  experienceLabels,
  formatLabels,
  goalLabels,
  labelOf,
  levelLabels,
  slotLabels,
  teachingAreaLabels,
} from "@/shared/lib/options";
import { normalizeStatus, statusLabel } from "@/shared/lib/workflow";

export const dynamic = "force-dynamic";

const stateLabel = {
  match: "Khớp",
  mismatch: "Lệch",
  unknown: "Chưa rõ",
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
      <>
        <PageHeader
          back={{ href: `/admin/requests/${id}`, label: "Chi tiết yêu cầu" }}
          title="Chọn gia sư"
        />
        <ErrorNotice>
          Chưa thể tải dữ liệu từ MongoDB. Vui lòng thử lại sau.
        </ErrorNotice>
      </>
    );
  }
  if (!request || !result) notFound();

  const status = normalizeStatus("learner", request.status);
  const canConnect = CONNECTABLE_REQUEST_STATUSES.includes(status);
  const slots = request.availabilitySlots?.length
    ? request.availabilitySlots
        .map((slot) => labelOf(slotLabels, slot))
        .join(", ")
    : request.availability;
  const keep = {
    level: options.soft.level,
    slots: options.soft.slots,
    fee: options.soft.fee,
    all: options.showAll,
  };

  return (
    <>
      <PageHeader
        back={{ href: `/admin/requests/${id}`, label: request.referenceCode }}
        eyebrow="Kết nối thủ công"
        title="Chọn gia sư"
        description="Bộ lọc chỉ giúp thu hẹp danh sách hồ sơ đã đủ điều kiện. Quyết định chọn ai do đội ngũ cân nhắc; hệ thống không tự chấm điểm hay tự chọn gia sư."
        actions={<StatusBadge kind="learner" status={status} large />}
      />

      {!canConnect && (
        <div
          className={`${styles.notice} ${styles.noticeWarn}`}
          style={{ marginBottom: 20 }}
        >
          <span>
            Yêu cầu đang ở trạng thái “{statusLabel("learner", status)}” nên
            chưa thể tạo kết nối mới.
          </span>
          <Link className={styles.link} href={`/admin/requests/${id}`}>
            Về trang yêu cầu
          </Link>
        </div>
      )}

      <Card title="Tiêu chí của người học">
        <DefList
          items={[
            { label: "Mục tiêu", value: labelOf(goalLabels, request.goal) },
            {
              label: "Trình độ",
              value: labelOf(levelLabels, request.currentLevel),
            },
            {
              label: "Hình thức",
              value: labelOf(formatLabels, request.format),
            },
            { label: "Lịch học", value: slots },
            { label: "Khu vực", value: request.location || "Không cung cấp" },
            {
              label: "Ngân sách tối đa / buổi",
              value: formatVnd(request.budgetMax) ?? "Chưa xác định",
            },
          ]}
        />
      </Card>

      <Card
        title="Bộ lọc gia sư"
        description="Luôn áp dụng: hồ sơ đã đủ điều kiện, nội dung dạy và hình thức. Bật thêm các tiêu chí còn lại nếu cần."
      >
        <form
          method="get"
          action={`/admin/requests/${id}/match`}
          className={styles.formGrid}
        >
          <div className={styles.toggleRow}>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                name="level"
                value="1"
                defaultChecked={options.soft.level}
              />
              Chỉ gia sư nhận đúng trình độ
            </label>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                name="slots"
                value="1"
                defaultChecked={options.soft.slots}
              />
              Chỉ gia sư có khung giờ trùng
            </label>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                name="fee"
                value="1"
                defaultChecked={options.soft.fee}
              />
              Chỉ gia sư trong ngân sách hoặc thỏa thuận
            </label>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                name="all"
                value="1"
                defaultChecked={options.showAll}
              />
              Hiện cả hồ sơ không khớp nội dung và hình thức
            </label>
          </div>
          <div className={styles.formActions}>
            <button
              type="submit"
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              Áp dụng bộ lọc
            </button>
          </div>
        </form>
      </Card>

      <div style={{ marginTop: 20 }}>
        {result.items.length ? (
          <>
            <p
              className={styles.mutedText}
              style={{ marginBottom: 12 }}
              aria-live="polite"
            >
              {result.total} hồ sơ phù hợp bộ lọc, trên tổng{" "}
              {result.eligibleTotal} hồ sơ đã đủ điều kiện.
            </p>
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
                <article className={styles.candidate} key={String(tutor._id)}>
                  <div className={styles.candidateHead}>
                    <div>
                      <h3>{tutor.fullName}</h3>
                      <p className={styles.candidateMeta}>
                        {tutor.referenceCode} ·{" "}
                        {labelOf(experienceLabels, tutor.experience)} ·{" "}
                        {tutor.teachingAreas
                          .map((area) => labelOf(teachingAreaLabels, area))
                          .join(", ")}
                      </p>
                    </div>
                    <Link
                      className={styles.link}
                      href={`/admin/tutors/${String(tutor._id)}`}
                      target="_blank"
                    >
                      Xem hồ sơ đầy đủ ↗
                    </Link>
                  </div>
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
                  {existing ? (
                    <div className={styles.connectRow}>
                      <p className={styles.mutedText}>
                        Đã ghi nhận kết nối với yêu cầu này (
                        {statusLabel("connection", existing.status)}).
                      </p>
                      <Link
                        className={`${styles.button} ${styles.buttonQuiet}`}
                        href={`/admin/connections/${String(existing._id)}`}
                      >
                        Mở kết nối
                      </Link>
                    </div>
                  ) : canConnect ? (
                    <ConnectForm requestId={id} tutorId={String(tutor._id)} />
                  ) : null}
                </article>
              );
            })}
            <Pagination
              result={result}
              path={`/admin/requests/${id}/match`}
              noun="hồ sơ"
              params={keep}
            />
          </>
        ) : (
          <Card>
            <EmptyState
              title={
                result.eligibleTotal
                  ? "Không có hồ sơ nào phù hợp bộ lọc"
                  : "Chưa có hồ sơ gia sư nào đủ điều kiện"
              }
            >
              {result.eligibleTotal
                ? "Thử bỏ bớt tiêu chí tùy chọn hoặc hiện cả hồ sơ không khớp."
                : "Hãy xem xét hồ sơ gia sư và đánh dấu “Đủ điều kiện giới thiệu” trước khi kết nối."}
            </EmptyState>
          </Card>
        )}
      </div>
    </>
  );
}
