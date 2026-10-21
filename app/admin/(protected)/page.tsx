import Link from "next/link";

import { LearnerRequest } from "@/lib/learner-request-model";
import { connectToDatabase } from "@/lib/mongodb";
import { goalLabels, formatLabels } from "@/lib/options";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  let total = 0;
  let recent: Array<Record<string, unknown>> = [];
  let dataUnavailable = false;
  try {
    await connectToDatabase();
    [total, recent] = await Promise.all([
      LearnerRequest.countDocuments(),
      LearnerRequest.find().sort({ createdAt: -1 }).limit(6).lean(),
    ]);
  } catch {
    dataUnavailable = true;
  }

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">DASHBOARD</span>
          <h1>Tổng quan yêu cầu</h1>
          <p>Theo dõi những người học đã gửi nhu cầu tìm gia sư tiếng Anh.</p>
        </div>
        <Link className="button button-primary" href="/admin/requests">
          Xem tất cả yêu cầu <span aria-hidden="true">→</span>
        </Link>
      </div>
      {dataUnavailable && (
        <div className="dashboard-alert" role="alert">
          Chưa thể kết nối MongoDB. Kiểm tra cấu hình và trạng thái cơ sở dữ
          liệu trước khi xử lý yêu cầu.
        </div>
      )}
      <div className="stat-grid">
        <article className="stat-card">
          <span>Tổng yêu cầu</span>
          <strong>{dataUnavailable ? "—" : total}</strong>
          <small>Đã gửi qua biểu mẫu</small>
        </article>
        <article className="stat-card accent">
          <span>Chờ xem xét</span>
          <strong>{dataUnavailable ? "—" : total}</strong>
          <small>Yêu cầu của người học</small>
        </article>
      </div>
      <section className="data-panel">
        <div className="data-panel-header">
          <div>
            <h2>Yêu cầu gần đây</h2>
            <p>Các yêu cầu mới nhất từ người học</p>
          </div>
          <Link href="/admin/requests">Xem tất cả →</Link>
        </div>
        {recent.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mã yêu cầu</th>
                  <th>Người học</th>
                  <th>Mục tiêu</th>
                  <th>Hình thức</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((item) => (
                  <tr key={String(item._id)}>
                    <td>
                      <Link
                        className="table-link"
                        href={`/admin/requests/${String(item._id)}`}
                      >
                        {String(item.referenceCode)}
                      </Link>
                    </td>
                    <td>{String(item.fullName)}</td>
                    <td>
                      {goalLabels[item.goal as keyof typeof goalLabels] ??
                        String(item.goal)}
                    </td>
                    <td>
                      {formatLabels[item.format as keyof typeof formatLabels] ??
                        String(item.format)}
                    </td>
                    <td>
                      <span className="status-pill">Mới nhận</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <span>◌</span>
            <h3>Chưa có yêu cầu nào</h3>
            <p>Khi người học gửi biểu mẫu, yêu cầu sẽ xuất hiện tại đây.</p>
          </div>
        )}
      </section>
    </>
  );
}
