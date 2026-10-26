import Link from "next/link";

import { requireAdminPage } from "@/features/admin-auth/server/guard";
import {
  Card,
  EmptyState,
  ErrorNotice,
  FilterBar,
  PageHeader,
  Pagination,
  StatusBadge,
  adminStyles as styles,
} from "@/features/admin/components/ui";
import { listTutors } from "@/features/admin/server/queries";
import { parseTutorListParams } from "@/features/admin/validation";
import { tutorFormatLabels } from "@/features/tutor-applications/validation";
import { formatDate } from "@/shared/lib/format";
import {
  experienceLabels,
  labelOf,
  teachingAreaLabels,
} from "@/shared/lib/options";
import { statusLabels, tutorStatuses } from "@/shared/lib/workflow";

export const dynamic = "force-dynamic";

const toOptions = (labels: Record<string, string>) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

export default async function TutorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const actor = await requireAdminPage();
  const params = parseTutorListParams(await searchParams);
  let result: Awaited<ReturnType<typeof listTutors>> | null = null;
  try {
    result = await listTutors(actor, params);
  } catch {
    result = null;
  }
  const filtered = Boolean(
    params.q || params.status || params.area || params.format,
  );

  return (
    <>
      <PageHeader
        eyebrow="Hồ sơ gia sư"
        title="Hồ sơ gia sư"
        description="Hồ sơ do gia sư tự khai báo. Chỉ hồ sơ đã được đội ngũ xem xét và đánh dấu đủ điều kiện mới được giới thiệu."
      />
      <Card>
        <FilterBar
          action="/admin/tutors"
          q={params.q}
          searchLabel="Tìm theo mã hoặc tên"
          clearHref="/admin/tutors"
          fields={[
            {
              name: "status",
              label: "Trạng thái",
              value: params.status,
              options: tutorStatuses.map((value) => ({
                value,
                label: statusLabels.tutor[value],
              })),
            },
            {
              name: "area",
              label: "Nội dung dạy",
              value: params.area,
              options: toOptions(teachingAreaLabels),
            },
            {
              name: "format",
              label: "Hình thức",
              value: params.format,
              options: toOptions(tutorFormatLabels),
            },
          ]}
        />
        {!result ? (
          <ErrorNotice>
            Chưa thể tải hồ sơ từ MongoDB. Vui lòng kiểm tra kết nối rồi tải lại
            trang.
          </ErrorNotice>
        ) : result.items.length ? (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Mã hồ sơ</th>
                    <th>Gia sư</th>
                    <th>Nội dung dạy</th>
                    <th>Hình thức</th>
                    <th>Kinh nghiệm</th>
                    <th>Ngày gửi</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((item) => (
                    <tr key={String(item._id)}>
                      <td data-label="Mã">
                        <Link
                          className={styles.tableLink}
                          href={`/admin/tutors/${String(item._id)}`}
                        >
                          {item.referenceCode}
                        </Link>
                      </td>
                      <td data-label="Gia sư">{item.fullName}</td>
                      <td data-label="Nội dung dạy">
                        {item.teachingAreas
                          .slice(0, 2)
                          .map((area) => labelOf(teachingAreaLabels, area))
                          .join(", ")}
                        {item.teachingAreas.length > 2 && (
                          <span className={styles.cellSub}>
                            +{item.teachingAreas.length - 2} nội dung khác
                          </span>
                        )}
                      </td>
                      <td data-label="Hình thức">
                        {labelOf(tutorFormatLabels, item.format)}
                      </td>
                      <td data-label="Kinh nghiệm">
                        {labelOf(experienceLabels, item.experience)}
                      </td>
                      <td data-label="Ngày gửi">
                        {formatDate(item.createdAt)}
                      </td>
                      <td data-label="Trạng thái">
                        <StatusBadge kind="tutor" status={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              result={result}
              path="/admin/tutors"
              noun="hồ sơ"
              params={{
                q: params.q,
                status: params.status,
                area: params.area,
                format: params.format,
              }}
            />
          </>
        ) : (
          <EmptyState
            title={
              filtered ? "Không có hồ sơ phù hợp" : "Chưa có hồ sơ gia sư nào"
            }
            action={
              filtered ? (
                <Link
                  className={`${styles.button} ${styles.buttonQuiet}`}
                  href="/admin/tutors"
                >
                  Xóa bộ lọc
                </Link>
              ) : undefined
            }
          >
            {filtered
              ? "Thử đổi từ khóa hoặc bỏ bớt bộ lọc."
              : "Hồ sơ gửi từ trang đăng ký gia sư sẽ xuất hiện tại đây."}
          </EmptyState>
        )}
      </Card>
    </>
  );
}
