import Link from "next/link";

import {
  EmptyState,
  ErrorNotice,
  PageHeader,
  SlaBadge,
  adminStyles as styles,
  Card,
} from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/admin-guard";
import { getDashboard } from "@/lib/admin-queries";
import { formatDateTime } from "@/lib/format";
import { formatLabels, goalLabels, labelOf } from "@/lib/options";
import {
  learnerStatuses,
  responseSla,
  statusLabels,
  tutorStatuses,
  connectionStatuses,
} from "@/lib/workflow";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  await requireAdminPage();
  let data: Awaited<ReturnType<typeof getDashboard>> | null = null;
  try {
    data = await getDashboard();
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <>
        <PageHeader eyebrow="Tổng quan" title="Tổng quan vận hành" />
        <ErrorNotice>
          Chưa thể kết nối MongoDB. Kiểm tra cấu hình và trạng thái cơ sở dữ
          liệu rồi tải lại trang.
        </ErrorNotice>
      </>
    );
  }

  const inProgress =
    data.learners.CONTACTED +
    data.learners.SEARCHING +
    data.learners.INTRODUCED;
  const { total, onTime } = data.contacted;

  return (
    <>
      <PageHeader
        eyebrow="Tổng quan"
        title="Tổng quan vận hành"
        description="Số liệu tính trực tiếp từ trạng thái đã lưu. Yêu cầu chỉ được tính là đã liên hệ khi đội ngũ ghi nhận."
        actions={
          <Link
            className={`${styles.button} ${styles.buttonPrimary}`}
            href="/admin/requests?status=NEW"
          >
            Xử lý yêu cầu mới
          </Link>
        }
      />

      <div className={styles.statGrid}>
        <Link
          href="/admin/requests?status=NEW"
          className={`${styles.stat} ${data.learners.NEW ? styles.statAlert : ""}`}
        >
          <span>Chưa liên hệ</span>
          <strong>{data.learners.NEW}</strong>
          <small>Yêu cầu mới nhận, cần phản hồi trong 24 giờ</small>
        </Link>
        <Link
          href="/admin/requests?overdue=1"
          className={`${styles.stat} ${data.overdue ? styles.statDanger : ""}`}
        >
          <span>Quá hạn 24 giờ</span>
          <strong>{data.overdue}</strong>
          <small>Chưa liên hệ sau hơn 24 giờ</small>
        </Link>
        <Link href="/admin/requests" className={styles.stat}>
          <span>Đang xử lý</span>
          <strong>{inProgress}</strong>
          <small>Đã liên hệ, đang tìm hoặc đã giới thiệu gia sư</small>
        </Link>
        <Link href="/admin/requests?status=STARTED" className={styles.stat}>
          <span>Đã bắt đầu học</span>
          <strong>{data.learners.STARTED}</strong>
          <small>Trên tổng {data.totals.learners} yêu cầu</small>
        </Link>
      </div>

      <div className={styles.splitGrid}>
        <Card
          title="Cần liên hệ trước"
          description="Yêu cầu chưa được liên hệ, cũ nhất lên đầu."
          action={
            <Link className={styles.link} href="/admin/requests?status=NEW">
              Xem tất cả →
            </Link>
          }
        >
          {data.waiting.length ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Mã</th>
                    <th>Người học</th>
                    <th>Gửi lúc</th>
                    <th>Mốc 24 giờ</th>
                  </tr>
                </thead>
                <tbody>
                  {data.waiting.map((item) => (
                    <tr key={String(item._id)}>
                      <td data-label="Mã">
                        <Link
                          className={styles.tableLink}
                          href={`/admin/requests/${String(item._id)}`}
                        >
                          {item.referenceCode}
                        </Link>
                      </td>
                      <td data-label="Người học">
                        {item.fullName}
                        <span className={styles.cellSub}>
                          {labelOf(goalLabels, item.goal)} ·{" "}
                          {labelOf(formatLabels, item.format)}
                        </span>
                      </td>
                      <td data-label="Gửi lúc">
                        {formatDateTime(item.createdAt)}
                      </td>
                      <td data-label="Mốc 24 giờ">
                        <SlaBadge
                          sla={responseSla({
                            status: item.status,
                            createdAt: item.createdAt,
                            contactedAt: item.contactedAt,
                          })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="Không có yêu cầu nào đang chờ liên hệ">
              Khi người học gửi biểu mẫu, yêu cầu mới sẽ xuất hiện tại đây cho
              đến khi đội ngũ ghi nhận đã liên hệ.
            </EmptyState>
          )}
        </Card>

        <div className={styles.stack}>
          <Card
            title="Phản hồi đúng hạn"
            description="Tính trên các yêu cầu đã ghi nhận thời điểm liên hệ."
          >
            {total ? (
              <p>
                <strong style={{ fontSize: 28, fontFamily: "var(--display)" }}>
                  {onTime}/{total}
                </strong>{" "}
                <span className={styles.mutedText}>
                  yêu cầu được liên hệ trong 24 giờ
                </span>
              </p>
            ) : (
              <p className={styles.mutedText}>
                Chưa có yêu cầu nào được ghi nhận đã liên hệ.
              </p>
            )}
          </Card>
          <Card
            title="Hồ sơ gia sư"
            action={
              <Link className={styles.link} href="/admin/tutors">
                Xem tất cả →
              </Link>
            }
          >
            <ul className={styles.miniStats}>
              {tutorStatuses.map((status) => (
                <li key={status}>
                  <Link href={`/admin/tutors?status=${status}`}>
                    {statusLabels.tutor[status]}
                  </Link>
                  <strong>{data.tutors[status]}</strong>
                </li>
              ))}
            </ul>
          </Card>
          <Card
            title="Kết nối"
            action={
              <Link className={styles.link} href="/admin/connections">
                Xem tất cả →
              </Link>
            }
          >
            <ul className={styles.miniStats}>
              {connectionStatuses.map((status) => (
                <li key={status}>
                  <Link href={`/admin/connections?status=${status}`}>
                    {statusLabels.connection[status]}
                  </Link>
                  <strong>{data.connections[status]}</strong>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Card
        title="Yêu cầu theo trạng thái"
        description={`${data.totals.learners} yêu cầu đã nhận.`}
      >
        <ul className={styles.miniStats}>
          {learnerStatuses.map((status) => (
            <li key={status}>
              <Link href={`/admin/requests?status=${status}`}>
                {statusLabels.learner[status]}
              </Link>
              <strong>{data.learners[status]}</strong>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
