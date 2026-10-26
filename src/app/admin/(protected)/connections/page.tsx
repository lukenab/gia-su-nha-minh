import Link from "next/link";

import { requireAdminPage } from "@/features/admin-auth/server/guard";
import {
  Card,
  EmptyState,
  ErrorNotice,
  FilterBar,
  Pagination,
  StatusBadge,
  adminStyles as styles,
} from "@/features/admin/components/ui";
import { listConnections } from "@/features/admin/server/queries";
import { parseConnectionListParams } from "@/features/admin/validation";
import { formatDateTime } from "@/shared/lib/format";
import { connectionStatuses, statusLabels } from "@/shared/lib/workflow";

export const dynamic = "force-dynamic";

export default async function ConnectionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPage();
  const params = parseConnectionListParams(await searchParams);
  let result: Awaited<ReturnType<typeof listConnections>> | null = null;
  try {
    result = await listConnections(params);
  } catch {
    result = null;
  }
  const filtered = Boolean(params.q || params.status);

  return (
    <div className={styles.connectionsPage}>
      <div className={`${styles.pageHeader} ${styles.connectionsHeader}`}>
        <span className={styles.eyebrow}>Kết nối thủ công</span>
        <h1>Kết nối</h1>
        <p>
          Lịch sử các gia sư đã được xem xét hoặc giới thiệu cho từng yêu cầu.
          Để tạo kết nối mới, mở một yêu cầu đã liên hệ và chọn gia sư.
        </p>
        <Link
          className={`${styles.button} ${styles.buttonQuiet} ${styles.connectionsHeaderAction}`}
          href="/admin/requests"
        >
          Mở danh sách yêu cầu
        </Link>
      </div>
      <Card>
        <FilterBar
          action="/admin/connections"
          q={params.q}
          searchLabel="Tìm theo mã yêu cầu hoặc mã gia sư"
          clearHref="/admin/connections"
          fields={[
            {
              name: "status",
              label: "Trạng thái",
              value: params.status,
              options: connectionStatuses.map((value) => ({
                value,
                label: statusLabels.connection[value],
              })),
            },
          ]}
        />
        {!result ? (
          <ErrorNotice>
            Chưa thể tải kết nối từ MongoDB. Vui lòng kiểm tra kết nối rồi tải
            lại trang.
          </ErrorNotice>
        ) : result.items.length ? (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Yêu cầu</th>
                    <th>Gia sư</th>
                    <th>Trạng thái</th>
                    <th>Cập nhật</th>
                    <th>Tạo bởi</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item) => (
                    <tr key={String(item._id)}>
                      <td data-label="Yêu cầu">
                        <Link
                          className={styles.tableLink}
                          href={`/admin/connections/${String(item._id)}`}
                        >
                          {item.requestCode}
                        </Link>
                        <span className={styles.cellSub}>
                          {item.learnerName}
                        </span>
                      </td>
                      <td data-label="Gia sư">
                        {item.tutorCode}
                        <span className={styles.cellSub}>{item.tutorName}</span>
                      </td>
                      <td data-label="Trạng thái">
                        <StatusBadge kind="connection" status={item.status} />
                      </td>
                      <td data-label="Cập nhật">
                        {formatDateTime(item.statusUpdatedAt)}
                        <span className={styles.cellSub}>
                          {item.statusUpdatedBy}
                        </span>
                      </td>
                      <td data-label="Tạo bởi">{item.createdBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              result={result}
              path="/admin/connections"
              noun="kết nối"
              params={{ q: params.q, status: params.status }}
            />
          </>
        ) : (
          <EmptyState
            title={
              filtered ? "Không có kết nối phù hợp" : "Chưa có kết nối nào"
            }
            action={
              filtered ? (
                <Link
                  className={`${styles.button} ${styles.buttonQuiet}`}
                  href="/admin/connections"
                >
                  Xóa bộ lọc
                </Link>
              ) : undefined
            }
          >
            {filtered
              ? "Thử đổi từ khóa hoặc bỏ bớt bộ lọc."
              : "Mở một yêu cầu đã liên hệ, chọn “Chọn gia sư” để ghi nhận gia sư được xem xét."}
          </EmptyState>
        )}
      </Card>
    </div>
  );
}
