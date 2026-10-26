import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdminPage } from "@/features/admin-auth/server/guard";
import { StatusForm } from "@/features/admin/components/status-form";
import {
  Card,
  DefList,
  ErrorNotice,
  HistoryList,
  PageHeader,
  StatusBadge,
  adminStyles as styles,
} from "@/features/admin/components/ui";
import { compareTutor } from "@/features/admin/matching";
import {
  connectionsForRequest,
  getConnection,
} from "@/features/admin/server/queries";
import { tutorFormatLabels } from "@/features/tutor-applications/validation";
import { formatDateTime, formatVnd } from "@/shared/lib/format";
import {
  formatLabels,
  goalLabels,
  labelOf,
  levelLabels,
  slotLabels,
  teachingAreaLabels,
} from "@/shared/lib/options";
import {
  normalizeStatus,
  statusLabel,
  statusOptions,
  suggestRequestStatus,
} from "@/shared/lib/workflow";

export const dynamic = "force-dynamic";

const stateLabel = {
  match: "Khớp",
  mismatch: "Lệch",
  unknown: "Chưa rõ",
} as const;

export default async function ConnectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  let data: Awaited<ReturnType<typeof getConnection>>;
  let siblings: Awaited<ReturnType<typeof connectionsForRequest>> = [];
  try {
    data = await getConnection(id);
    if (data)
      siblings = await connectionsForRequest(String(data.connection.request));
  } catch {
    return (
      <>
        <PageHeader
          back={{ href: "/admin/connections", label: "Tất cả kết nối" }}
          title="Chi tiết kết nối"
        />
        <ErrorNotice>
          Chưa thể tải kết nối từ MongoDB. Vui lòng thử lại sau.
        </ErrorNotice>
      </>
    );
  }
  if (!data) notFound();

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

  return (
    <>
      <PageHeader
        back={{ href: "/admin/connections", label: "Tất cả kết nối" }}
        eyebrow="Chi tiết kết nối"
        title={`${connection.requestCode} ↔ ${connection.tutorCode}`}
        description={`Tạo lúc ${formatDateTime(connection.createdAt)} bởi ${connection.createdBy}`}
        actions={<StatusBadge kind="connection" status={status} large />}
      />

      {suggestion && request && (
        <div className={styles.notice} style={{ marginBottom: 20 }}>
          <span>
            {suggestion.text} Có thể chuyển yêu cầu sang “
            {statusLabel("learner", suggestion.to)}”.
          </span>
          <Link
            className={styles.link}
            href={`/admin/requests/${String(connection.request)}`}
          >
            Mở yêu cầu để xác nhận →
          </Link>
        </div>
      )}
      {tutorStatus && tutorStatus !== "ELIGIBLE" && (
        <div
          className={`${styles.notice} ${styles.noticeWarn}`}
          style={{ marginBottom: 20 }}
        >
          Hồ sơ gia sư hiện là “{statusLabel("tutor", tutorStatus)}”, không còn
          đủ điều kiện để giới thiệu thêm.
        </div>
      )}

      <div className={styles.detailLayout}>
        <div className={styles.stack}>
          <Card
            title="Yêu cầu của người học"
            action={
              request && (
                <Link
                  className={styles.link}
                  href={`/admin/requests/${String(request._id)}`}
                >
                  Mở yêu cầu →
                </Link>
              )
            }
          >
            {request ? (
              <DefList
                items={[
                  { label: "Người học", value: request.fullName },
                  {
                    label: "Mục tiêu",
                    value: labelOf(goalLabels, request.goal),
                  },
                  {
                    label: "Trình độ",
                    value: labelOf(levelLabels, request.currentLevel),
                  },
                  {
                    label: "Hình thức",
                    value: labelOf(formatLabels, request.format),
                  },
                  {
                    label: "Lịch học",
                    value: request.availabilitySlots?.length
                      ? request.availabilitySlots
                          .map((slot) => labelOf(slotLabels, slot))
                          .join(", ")
                      : request.availability,
                  },
                  {
                    label: "Ngân sách tối đa",
                    value: formatVnd(request.budgetMax) ?? "Chưa xác định",
                  },
                ]}
              />
            ) : (
              <p className={styles.mutedText}>Không tìm thấy yêu cầu gốc.</p>
            )}
          </Card>

          <Card
            title="Hồ sơ gia sư"
            action={
              tutor && (
                <Link
                  className={styles.link}
                  href={`/admin/tutors/${String(tutor._id)}`}
                >
                  Mở hồ sơ →
                </Link>
              )
            }
          >
            {tutor ? (
              <DefList
                items={[
                  { label: "Gia sư", value: tutor.fullName },
                  {
                    label: "Nội dung dạy",
                    value: tutor.teachingAreas
                      .map((area) => labelOf(teachingAreaLabels, area))
                      .join(", "),
                  },
                  {
                    label: "Hình thức",
                    value: labelOf(tutorFormatLabels, tutor.format),
                  },
                  {
                    label: "Học phí mong muốn",
                    value: formatVnd(tutor.expectedFee) ?? "Thỏa thuận",
                  },
                ]}
              />
            ) : (
              <p className={styles.mutedText}>Không tìm thấy hồ sơ gia sư.</p>
            )}
          </Card>

          {checks.length > 0 && (
            <Card
              title="Đối chiếu tiêu chí"
              description="Chỉ để tham khảo. Đây không phải điểm phù hợp và không quyết định việc kết nối."
            >
              <ul className={styles.checks} style={{ marginTop: 0 }}>
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
            </Card>
          )}
        </div>

        <div className={styles.stack}>
          <Card
            title="Cập nhật kết nối"
            description="Việc liên hệ và giới thiệu diễn ra ngoài hệ thống; hãy ghi lại kết quả tại đây."
          >
            <StatusForm
              key={status}
              endpoint={`/api/admin/connections/${id}/status`}
              current={status}
              options={statusOptions("connection", status)}
              noteHelp="Ghi kết quả hoặc lý do. Hệ thống không gửi tin nhắn hay email cho ai."
            />
          </Card>
          <Card title="Lịch sử">
            <HistoryList
              kind="connection"
              entries={connection.history}
              emptyText="Chưa có lịch sử."
            />
          </Card>
        </div>
      </div>
    </>
  );
}
