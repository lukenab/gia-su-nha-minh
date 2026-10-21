import Link from "next/link";

import { connectToDatabase } from "@/lib/mongodb";
import { labelOf, teachingAreaLabels } from "@/lib/options";
import { TutorApplication } from "@/lib/tutor-application-model";
import { tutorFormatLabels } from "@/lib/tutor-application-validation";

export const dynamic = "force-dynamic";

export default async function TutorApplicationsPage() {
  let items: Array<Record<string, unknown>> = [];
  let unavailable = false;
  try {
    await connectToDatabase();
    items = await TutorApplication.find()
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
          <span className="eyebrow">TIẾP NHẬN GIA SƯ</span>
          <h1>Hồ sơ gia sư</h1>
          <p>
            Danh sách tối đa 100 hồ sơ gần nhất. Kiểm tra danh tính, chứng chỉ
            và kinh nghiệm trước khi giới thiệu người học.
          </p>
        </div>
        <span className="count-chip">{items.length} hồ sơ</span>
      </div>
      {unavailable && (
        <div className="dashboard-alert" role="alert">
          Chưa thể tải hồ sơ từ MongoDB. Vui lòng kiểm tra kết nối.
        </div>
      )}
      <section className="data-panel">
        <div className="data-panel-header">
          <div>
            <h2>Danh sách hồ sơ</h2>
            <p>Chỉ tài khoản quản trị có thể xem thông tin này.</p>
          </div>
        </div>
        {items.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mã hồ sơ</th>
                  <th>Gia sư</th>
                  <th>Nội dung dạy</th>
                  <th>Hình thức</th>
                  <th>Ngày gửi</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={String(item._id)}>
                    <td>
                      <Link
                        className="table-link"
                        href={`/admin/tutors/${String(item._id)}`}
                      >
                        {String(item.referenceCode)}
                      </Link>
                    </td>
                    <td>{String(item.fullName)}</td>
                    <td>
                      {((item.teachingAreas as string[]) ?? [])
                        .map((value) => labelOf(teachingAreaLabels, value))
                        .join(", ")}
                    </td>
                    <td>{labelOf(tutorFormatLabels, item.format)}</td>
                    <td>
                      {new Date(String(item.createdAt)).toLocaleDateString(
                        "vi-VN",
                      )}
                    </td>
                    <td>
                      <span className="status-pill">Chờ kiểm tra</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <span>◌</span>
            <h3>Chưa có hồ sơ nào</h3>
            <p>Khi gia sư gửi hồ sơ, thông tin sẽ xuất hiện tại đây.</p>
          </div>
        )}
      </section>
    </>
  );
}
