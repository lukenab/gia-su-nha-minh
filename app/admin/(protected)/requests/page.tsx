import Link from "next/link";

import {
  Card,
  EmptyState,
  ErrorNotice,
  FilterBar,
  PageHeader,
  Pagination,
  SlaBadge,
  StatusBadge,
  adminStyles as styles,
} from "@/components/admin/ui";
import { requireAdminPage } from "@/lib/admin-guard";
import { listRequests } from "@/lib/admin-queries";
import { parseRequestListParams } from "@/lib/admin-validation";
import { formatDate } from "@/lib/format";
import { formatLabels, goalLabels, labelOf } from "@/lib/options";
import { learnerStatuses, responseSla, statusLabels } from "@/lib/workflow";

export const dynamic = "force-dynamic";

const toOptions = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPage();
  const params = parseRequestListParams(await searchParams);
  let result: Awaited<ReturnType<typeof listRequests>> | null = null;
  try {
    result = await listRequests(params);
  } catch {
    result = null;
  }
  const filtered = Boolean(
    params.q || params.status || params.goal || params.format || params.overdue,
  );

  return (
    <>
      <PageHeader
        eyebrow="Tiếp nhận người học"
        title="Yêu cầu học"
        description="Tìm theo mã hoặc tên, lọc theo trạng thái, mục tiêu hoặc hình thức. Chọn mã để xử lý."
      />
      <Card>
        <FilterBar
          action="/admin/requests"
          q={params.q}
          searchLabel="Tìm theo mã hoặc tên"
          clearHref="/admin/requests"
          fields={[
            {
              name: "status",
              label: "Trạng thái",
              value: params.status,
              options: learnerStatuses.map((value) => ({
                value,
                label: statusLabels.learner[value],
              })),
            },
            {
              name: "goal",
              label: "Mục tiêu",
              value: params.goal,
              options: toOptions(goalLabels),
            },
            {
              name: "format",
              label: "Hình thức",
              value: params.format,
              options: toOptions(formatLabels),
            },
          ]}
        />
        {params.overdue && (
          <p className={styles.mutedText} style={{ marginBottom: 12 }}>
            Đang lọc: yêu cầu chưa liên hệ và đã quá 24 giờ.{" "}
            <Link className={styles.link} href="/admin/requests">
              Bỏ lọc quá hạn
            </Link>
          </p>
        )}
        {!result ? (
          <ErrorNotice>
            Chưa thể tải yêu cầu từ MongoDB. Vui lòng kiểm tra kết nối rồi tải
            lại trang.
          </ErrorNotice>
        ) : result.items.length ? (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Mã yêu cầu</th>
                    <th>Người học</th>
                    <th>Mục tiêu</th>
                    <th>Hình thức</th>
                    <th>Ngày gửi</th>
                    <th>Mốc 24 giờ</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item) => (
                    <tr key={String(item._id)}>
                      <td data-label="Mã">
                        <Link
                          className={styles.tableLink}
                          href={`/admin/requests/${String(item._id)}`}
                        >
                          {item.referenceCode}
                        </Link>
                      </td>
                      <td data-label="Người học">{item.fullName}</td>
                      <td data-label="Mục tiêu">
                        {labelOf(goalLabels, item.goal)}
                      </td>
                      <td data-label="Hình thức">
                        {labelOf(formatLabels, item.format)}
                      </td>
                      <td data-label="Ngày gửi">
                        {formatDate(item.createdAt)}
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
                      <td data-label="Trạng thái">
                        <StatusBadge kind="learner" status={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              result={result}
              path="/admin/requests"
              noun="yêu cầu"
              params={{
                q: params.q,
                status: params.overdue ? undefined : params.status,
                goal: params.goal,
                format: params.format,
                overdue: params.overdue,
              }}
            />
          </>
        ) : (
          <EmptyState
            title={
              filtered ? "Không có yêu cầu phù hợp" : "Chưa có yêu cầu nào"
            }
            action={
              filtered ? (
                <Link
                  className={`${styles.button} ${styles.buttonQuiet}`}
                  href="/admin/requests"
                >
                  Xóa bộ lọc
                </Link>
              ) : undefined
            }
          >
            {filtered
              ? "Thử đổi từ khóa hoặc bỏ bớt bộ lọc."
              : "Khi người học gửi biểu mẫu, yêu cầu sẽ xuất hiện tại đây."}
          </EmptyState>
        )}
      </Card>
    </>
  );
}
