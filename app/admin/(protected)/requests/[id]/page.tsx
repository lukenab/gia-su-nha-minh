import mongoose from "mongoose";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LearnerRequest } from "@/lib/learner-request-model";
import { connectToDatabase } from "@/lib/mongodb";
import {
  channelLabels,
  concernLabels,
  formatLabels,
  goalLabels,
  labelOf,
  levelLabels,
  startLabels,
} from "@/lib/options";

export const dynamic = "force-dynamic";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();
  await connectToDatabase();
  const item = await LearnerRequest.findById(id).lean();
  if (!item) notFound();

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <Link className="back-link" href="/admin/requests">
            ← Tất cả yêu cầu
          </Link>
          <span className="eyebrow">CHI TIẾT YÊU CẦU</span>
          <h1>{item.referenceCode}</h1>
          <p>Đã gửi ngày {new Date(item.createdAt).toLocaleString("vi-VN")}</p>
        </div>
        <span className="status-pill large">Mới nhận</span>
      </div>
      <div className="detail-grid">
        <section className="detail-card">
          <h2>Nhu cầu học tập</h2>
          <dl>
            <div>
              <dt>Mục tiêu ưu tiên</dt>
              <dd>
                {goalLabels[item.goal as keyof typeof goalLabels] ?? item.goal}
              </dd>
            </div>
            <div>
              <dt>Trình độ hiện tại</dt>
              <dd>
                {levelLabels[item.currentLevel as keyof typeof levelLabels] ??
                  item.currentLevel}
              </dd>
            </div>
            <div>
              <dt>Hình thức</dt>
              <dd>
                {formatLabels[item.format as keyof typeof formatLabels] ??
                  item.format}
              </dd>
            </div>
            <div>
              <dt>Muốn bắt đầu</dt>
              <dd>
                {item.startTime
                  ? labelOf(startLabels, item.startTime)
                  : "Không cung cấp"}
              </dd>
            </div>
            <div>
              <dt>Điều quan tâm khi chọn gia sư</dt>
              <dd>
                {item.concerns?.length
                  ? item.concerns
                      .map((value: string) => labelOf(concernLabels, value))
                      .join(", ")
                  : "Không cung cấp"}
              </dd>
            </div>
            <div>
              <dt>Ngân sách tối đa / buổi</dt>
              <dd>
                {item.budgetMax == null
                  ? "Chưa xác định"
                  : `${Number(item.budgetMax).toLocaleString("vi-VN")} VND`}
              </dd>
            </div>
            <div>
              <dt>Thời gian có thể học</dt>
              <dd>{item.availability}</dd>
            </div>
            <div>
              <dt>Khu vực</dt>
              <dd>{item.location || "Không cung cấp"}</dd>
            </div>
            <div>
              <dt>Ghi chú</dt>
              <dd>{item.notes || "Không có"}</dd>
            </div>
          </dl>
        </section>
        <section className="detail-card">
          <h2>Thông tin liên hệ</h2>
          <dl>
            <div>
              <dt>Họ và tên</dt>
              <dd>{item.fullName}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{item.email || "Không cung cấp"}</dd>
            </div>
            <div>
              <dt>Số điện thoại</dt>
              <dd>{item.phone || "Không cung cấp"}</dd>
            </div>
            <div>
              <dt>Kênh liên hệ ưu tiên</dt>
              <dd>
                {item.preferredChannel
                  ? labelOf(channelLabels, item.preferredChannel)
                  : "Không cung cấp"}
              </dd>
            </div>
            <div>
              <dt>Đồng ý sử dụng dữ liệu</dt>
              <dd>{new Date(item.consentAt).toLocaleString("vi-VN")}</dd>
            </div>
          </dl>
          <p className="detail-note">
            Chỉ sử dụng thông tin liên hệ để xử lý yêu cầu này. Không chia sẻ ra
            ngoài nhóm khi chưa có sự đồng ý phù hợp.
          </p>
        </section>
      </div>
    </>
  );
}
