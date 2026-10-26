import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdminPage } from "@/features/admin-auth/server/guard";
import { NoteForm } from "@/features/admin/components/note-form";
import { StatusForm } from "@/features/admin/components/status-form";
import {
  Card,
  DefList,
  EmptyState,
  ErrorNotice,
  HistoryList,
  PageHeader,
  SlaBadge,
  StatusBadge,
  adminStyles as styles,
} from "@/features/admin/components/ui";
import {
  connectionsForRequest,
  getRequest,
} from "@/features/admin/server/queries";
import { CONNECTABLE_REQUEST_STATUSES } from "@/features/admin/server/service";
import { formatDateTime, formatVnd } from "@/shared/lib/format";
import {
  channelLabels,
  concernLabels,
  formatLabels,
  goalLabels,
  labelOf,
  levelLabels,
  slotLabels,
  startLabels,
} from "@/shared/lib/options";
import {
  normalizeStatus,
  responseSla,
  statusOptions,
  suggestRequestStatus,
} from "@/shared/lib/workflow";

export const dynamic = "force-dynamic";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  let item: Awaited<ReturnType<typeof getRequest>>;
  let connections: Awaited<ReturnType<typeof connectionsForRequest>> = [];
  try {
    item = await getRequest(id);
    if (item) connections = await connectionsForRequest(id);
  } catch {
    return (
      <>
        <PageHeader
          back={{ href: "/admin/requests", label: "Tất cả yêu cầu" }}
          title="Chi tiết yêu cầu"
        />
        <ErrorNotice>
          Chưa thể tải yêu cầu từ MongoDB. Vui lòng thử lại sau.
        </ErrorNotice>
      </>
    );
  }
  if (!item) notFound();

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
  const slots = item.availabilitySlots?.length
    ? item.availabilitySlots.map((slot) => labelOf(slotLabels, slot)).join(", ")
    : null;

  return (
    <>
      <PageHeader
        back={{ href: "/admin/requests", label: "Tất cả yêu cầu" }}
        eyebrow="Chi tiết yêu cầu"
        title={item.referenceCode}
        description={`Gửi lúc ${formatDateTime(item.createdAt)}`}
        actions={
          <>
            <SlaBadge sla={sla} />
            <StatusBadge kind="learner" status={status} large />
          </>
        }
      />

      <div className={styles.detailLayout}>
        <div className={styles.stack}>
          <Card title="Nhu cầu học tập">
            <DefList
              items={[
                {
                  label: "Mục tiêu ưu tiên",
                  value: labelOf(goalLabels, item.goal),
                },
                {
                  label: "Trình độ hiện tại",
                  value: labelOf(levelLabels, item.currentLevel),
                },
                {
                  label: "Hình thức",
                  value: labelOf(formatLabels, item.format),
                },
                {
                  label: "Muốn bắt đầu",
                  value: item.startTime
                    ? labelOf(startLabels, item.startTime)
                    : "Không cung cấp",
                },
                {
                  label: "Điều quan tâm",
                  value: item.concerns?.length
                    ? item.concerns
                        .map((value) => labelOf(concernLabels, value))
                        .join(", ")
                    : "Không cung cấp",
                },
                {
                  label: "Ngân sách tối đa / buổi",
                  value: formatVnd(item.budgetMax) ?? "Chưa xác định",
                },
                { label: "Lịch học", value: slots ?? item.availability },
                ...(slots && item.availability !== slots
                  ? [{ label: "Ghi chú lịch", value: item.availability }]
                  : []),
                { label: "Khu vực", value: item.location || "Không cung cấp" },
                {
                  label: "Ghi chú của người học",
                  value: item.notes || "Không có",
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
                  value: item.preferredChannel
                    ? labelOf(channelLabels, item.preferredChannel)
                    : "Không cung cấp",
                },
                {
                  label: "Đồng ý sử dụng dữ liệu",
                  value: formatDateTime(item.consentAt),
                },
                {
                  label: "Ghi nhận đã liên hệ",
                  value: item.contactedAt
                    ? formatDateTime(item.contactedAt)
                    : "Chưa ghi nhận",
                },
              ]}
            />
            <p className={styles.privacy}>
              Chỉ dùng thông tin này để xử lý yêu cầu. Không chia sẻ ra ngoài
              đội ngũ và không gửi cho gia sư khi chưa có sự đồng ý phù hợp.
            </p>
          </Card>

          <Card
            title="Kết nối gia sư"
            description="Ghi nhận các gia sư đã được xem xét hoặc giới thiệu cho yêu cầu này."
            action={
              canConnect ? (
                <Link
                  className={`${styles.button} ${styles.buttonPrimary}`}
                  href={`/admin/requests/${id}/match`}
                >
                  Chọn gia sư
                </Link>
              ) : undefined
            }
          >
            {!canConnect && (
              <p
                className={`${styles.notice} ${styles.noticeWarn}`}
                style={{ marginBottom: 14 }}
              >
                {status === "NEW"
                  ? "Hãy liên hệ người học và ghi nhận “Đã liên hệ” trước khi chọn gia sư."
                  : "Yêu cầu ở trạng thái này không nhận thêm kết nối mới."}
              </p>
            )}
            {connections.length ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Gia sư</th>
                      <th>Trạng thái</th>
                      <th>Cập nhật</th>
                    </tr>
                  </thead>
                  <tbody>
                    {connections.map((connection) => (
                      <tr key={String(connection._id)}>
                        <td data-label="Gia sư">
                          <Link
                            className={styles.tableLink}
                            href={`/admin/connections/${String(connection._id)}`}
                          >
                            {connection.tutorCode}
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
              <EmptyState title="Chưa có gia sư nào được ghi nhận">
                Việc liên hệ và giới thiệu do đội ngũ thực hiện bên ngoài; hệ
                thống chỉ ghi lại quá trình.
              </EmptyState>
            )}
          </Card>
        </div>

        <div className={styles.stack}>
          <Card
            title="Xử lý yêu cầu"
            description="Trạng thái do đội ngũ cập nhật thủ công."
          >
            <StatusForm
              key={status}
              endpoint={`/api/admin/requests/${id}/status`}
              current={status}
              options={statusOptions("learner", status)}
              suggestion={suggestion ?? undefined}
              noteHelp={
                status === "NEW"
                  ? "Chọn “Đã liên hệ” chỉ khi đã thực sự liên hệ người học; lúc đó mốc 24 giờ mới được tính."
                  : undefined
              }
            />
          </Card>
          <Card title="Ghi chú nội bộ">
            <NoteForm
              key={`${item.internalNoteUpdatedAt ?? "none"}`}
              endpoint={`/api/admin/requests/${id}/note`}
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
              kind="learner"
              entries={item.statusHistory}
              emptyText="Chưa có thay đổi trạng thái nào."
            />
          </Card>
        </div>
      </div>
    </>
  );
}
