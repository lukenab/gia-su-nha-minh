import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdminPage } from "@/features/admin-auth/server/guard";
import { NoteForm } from "@/features/admin/components/note-form";
import { StatusForm } from "@/features/admin/components/status-form";
import {
  TutorReviewForm,
  type ReviewView,
} from "@/features/admin/components/tutor-review-form";
import {
  Card,
  DefList,
  EmptyState,
  ErrorNotice,
  HistoryList,
  PageHeader,
  StatusBadge,
  adminStyles as styles,
} from "@/features/admin/components/ui";
import { connectionsForTutor, getTutor } from "@/features/admin/server/queries";
import { missingReviews, reviewLabels } from "@/features/admin/server/service";
import { tutorFormatLabels } from "@/features/tutor-applications/validation";
import {
  formatDate,
  formatDateTime,
  formatVnd,
  todayInVietnam,
} from "@/shared/lib/format";
import {
  channelLabels,
  experienceLabels,
  labelOf,
  slotLabels,
  teachingAreaLabels,
  tutorLevelLabels,
} from "@/shared/lib/options";
import { normalizeStatus, statusOptions } from "@/shared/lib/workflow";

export const dynamic = "force-dynamic";

const list = (labels: Record<string, string>, values?: string[]) =>
  values?.length
    ? values.map((value) => labelOf(labels, value)).join(", ")
    : "Không cung cấp";

const reviewHints = {
  identity: "Đối chiếu giấy tờ tùy thân hoặc xác nhận trực tiếp với gia sư.",
  certificates: "Xem bản gốc hoặc nguồn xác thực của chứng chỉ gia sư đã khai.",
  experience:
    "Đối chiếu kinh nghiệm giảng dạy đã mô tả (người giới thiệu, bài dạy thử...).",
} as const;

export default async function TutorApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  let item: Awaited<ReturnType<typeof getTutor>>;
  let connections: Awaited<ReturnType<typeof connectionsForTutor>> = [];
  try {
    item = await getTutor(id);
    if (item) connections = await connectionsForTutor(id);
  } catch {
    return (
      <>
        <PageHeader
          back={{ href: "/admin/tutors", label: "Tất cả hồ sơ" }}
          title="Hồ sơ gia sư"
        />
        <ErrorNotice>
          Chưa thể tải hồ sơ từ MongoDB. Vui lòng thử lại sau.
        </ErrorNotice>
      </>
    );
  }
  if (!item) notFound();

  const status = normalizeStatus("tutor", item.status);
  const missing = missingReviews(item.reviews);
  const views: ReviewView[] = (
    ["identity", "certificates", "experience"] as const
  ).map((check) => {
    const step = item.reviews?.[check];
    return {
      check,
      title: reviewLabels[check],
      hint: reviewHints[check],
      reviewed: Boolean(step?.reviewed),
      summary: step?.reviewed
        ? `Đã xem xét ngày ${formatDate(step.reviewedAt)} bởi ${step.reviewedBy || "—"}`
        : "",
      note: step?.note ?? "",
    };
  });

  return (
    <>
      <PageHeader
        back={{ href: "/admin/tutors", label: "Tất cả hồ sơ" }}
        eyebrow="Hồ sơ gia sư"
        title={item.referenceCode}
        description={`Gửi lúc ${formatDateTime(item.createdAt)}`}
        actions={<StatusBadge kind="tutor" status={status} large />}
      />

      <div className={styles.detailLayout}>
        <div className={styles.stack}>
          <Card
            title="Chuyên môn (gia sư tự khai báo)"
            description="Thông tin này chưa được xác minh cho đến khi đội ngũ ghi nhận từng bước xem xét."
          >
            <DefList
              items={[
                {
                  label: "Nội dung giảng dạy",
                  value: list(teachingAreaLabels, item.teachingAreas),
                },
                {
                  label: "Trình độ người học",
                  value: list(tutorLevelLabels, item.learnerLevels),
                },
                {
                  label: "Kinh nghiệm",
                  value: labelOf(experienceLabels, item.experience),
                },
                { label: "Mô tả kinh nghiệm", value: item.experienceNote },
                {
                  label: "Chứng chỉ khai báo",
                  value: item.certificates || "Không cung cấp",
                },
                {
                  label: "Hình thức",
                  value: labelOf(tutorFormatLabels, item.format),
                },
                {
                  label: "Khu vực dạy trực tiếp",
                  value: item.area || "Không cung cấp",
                },
                {
                  label: "Khung giờ",
                  value: list(slotLabels, item.availabilitySlots),
                },
                {
                  label: "Học phí mong muốn / buổi",
                  value: formatVnd(item.expectedFee) ?? "Thỏa thuận",
                },
              ]}
            />
          </Card>

          <Card title="Thông tin liên hệ">
            <DefList
              items={[
                { label: "Họ và tên", value: item.fullName },
                { label: "Email", value: item.email || "Không cung cấp" },
                {
                  label: "Số điện thoại",
                  value: item.phone || "Không cung cấp",
                },
                {
                  label: "Kênh ưu tiên",
                  value: labelOf(channelLabels, item.preferredChannel),
                },
                {
                  label: "Đồng ý sử dụng dữ liệu",
                  value: formatDateTime(item.consentAt),
                },
              ]}
            />
            <p className={styles.privacy}>
              Không chia sẻ thông tin liên hệ của gia sư ra ngoài đội ngũ khi
              chưa có sự đồng ý phù hợp.
            </p>
          </Card>

          <Card
            title="Yêu cầu liên quan"
            description="Các yêu cầu học đã được xem xét hoặc giới thiệu gia sư này."
          >
            {connections.length ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Yêu cầu</th>
                      <th>Trạng thái</th>
                      <th>Cập nhật</th>
                    </tr>
                  </thead>
                  <tbody>
                    {connections.map((connection) => (
                      <tr key={String(connection._id)}>
                        <td data-label="Yêu cầu">
                          <Link
                            className={styles.tableLink}
                            href={`/admin/connections/${String(connection._id)}`}
                          >
                            {connection.requestCode}
                          </Link>
                          <span className={styles.cellSub}>
                            {connection.otherName}
                          </span>
                        </td>
                        <td data-label="Trạng thái">
                          <StatusBadge
                            kind="connection"
                            status={connection.status}
                          />
                        </td>
                        <td data-label="Cập nhật">
                          {formatDateTime(connection.statusUpdatedAt)}
                          <span className={styles.cellSub}>
                            {connection.statusUpdatedBy}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="Chưa có yêu cầu liên quan">
                Gia sư chỉ xuất hiện khi hồ sơ đủ điều kiện và được chọn từ một
                yêu cầu học.
              </EmptyState>
            )}
          </Card>
        </div>

        <div className={styles.stack}>
          <Card
            title="Xem xét hồ sơ"
            description="Ghi nhận riêng từng bước. Gửi biểu mẫu không đồng nghĩa với đã xác minh."
          >
            <TutorReviewForm
              endpoint={`/api/admin/tutors/${id}/review`}
              views={views}
              today={todayInVietnam()}
              editable={status === "REVIEWING"}
              lockedReason={
                status === "NEW"
                  ? "Chuyển hồ sơ sang “Đang xem xét” để bắt đầu ghi nhận."
                  : "Chuyển hồ sơ về “Đang xem xét” nếu cần chỉnh sửa các ghi nhận."
              }
            />
          </Card>
          <Card title="Trạng thái hồ sơ">
            {status === "REVIEWING" && missing.length > 0 && (
              <p
                className={`${styles.notice} ${styles.noticeWarn}`}
                style={{ marginBottom: 14 }}
              >
                Cần ghi nhận:{" "}
                {missing
                  .map((check) => reviewLabels[check].toLowerCase())
                  .join(", ")}{" "}
                trước khi đánh dấu đủ điều kiện.
              </p>
            )}
            <StatusForm
              key={`${status}-${missing.length}`}
              endpoint={`/api/admin/tutors/${id}/status`}
              current={status}
              options={statusOptions("tutor", status).filter(
                (option) => option.value !== "ELIGIBLE" || missing.length === 0,
              )}
              noteHelp="Ghi chú hoặc lý do sẽ được lưu cùng lịch sử trạng thái."
            />
          </Card>
          <Card title="Ghi chú nội bộ">
            <NoteForm
              key={`${item.internalNoteUpdatedAt ?? "none"}`}
              endpoint={`/api/admin/tutors/${id}/note`}
              initial={item.internalNote ?? ""}
              meta={
                item.internalNoteUpdatedAt
                  ? `Cập nhật ${formatDateTime(item.internalNoteUpdatedAt)} bởi ${item.internalNoteUpdatedBy}.`
                  : undefined
              }
            />
          </Card>
          <Card title="Lịch sử trạng thái">
            <HistoryList
              kind="tutor"
              entries={item.statusHistory}
              emptyText="Chưa có thay đổi trạng thái nào."
            />
          </Card>
        </div>
      </div>
    </>
  );
}
