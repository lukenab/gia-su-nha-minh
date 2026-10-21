import Link from "next/link";

import { LearnerRequest } from "@/lib/learner-request-model";
import { connectToDatabase } from "@/lib/mongodb";
import { goalLabels, formatLabels } from "@/lib/options";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  let requests: Array<Record<string, unknown>> = [];
  let unavailable = false;
  try {
    await connectToDatabase();
    requests = await LearnerRequest.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
  } catch {
    unavailable = true;
  }

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">TIẾP NHẬN NGƯỜI HỌC</span>
          <h1>Yêu cầu tìm gia sư</h1>
          <p>
            Danh sách tối đa 100 yêu cầu gần nhất. Chọn mã để xem thông tin chi
            tiết.
          </p>
        </div>
        <span className="count-chip">{requests.length} yêu cầu</span>
      </div>
      {unavailable && (
        <div className="dashboard-alert" role="alert">
          Chưa thể tải yêu cầu từ MongoDB. Vui lòng kiểm tra kết nối.
        </div>
      )}
      <section className="data-panel">
        <div className="data-panel-header">
          <div>
            <h2>Danh sách yêu cầu</h2>
            <p>Chỉ tài khoản quản trị có thể xem thông tin này.</p>
          </div>
        </div>
        {requests.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mã yêu cầu</th>
                  <th>Người học</th>
                  <th>Mục tiêu</th>
                  <th>Hình thức</th>
                  <th>Ngày gửi</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((item) => (
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
                      {new Date(item.createdAt as Date).toLocaleDateString(
                        "vi-VN",
                      )}
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
            <p>Các yêu cầu hợp lệ được lưu vào MongoDB sẽ xuất hiện tại đây.</p>
          </div>
        )}
      </section>
    </>
  );
}
