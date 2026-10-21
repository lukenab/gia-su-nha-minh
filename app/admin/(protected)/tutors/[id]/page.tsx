import mongoose from "mongoose";
import Link from "next/link";
import { notFound } from "next/navigation";

import { connectToDatabase } from "@/lib/mongodb";
import {
  channelLabels,
  experienceLabels,
  labelOf,
  slotLabels,
  teachingAreaLabels,
  tutorLevelLabels,
} from "@/lib/options";
import { TutorApplication } from "@/lib/tutor-application-model";
import { tutorFormatLabels } from "@/lib/tutor-application-validation";

export const dynamic = "force-dynamic";

const list = (labels: Record<string, string>, values?: string[]) =>
  values?.length
    ? values.map((value) => labelOf(labels, value)).join(", ")
    : "Không cung cấp";

export default async function TutorApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();
  await connectToDatabase();
  const item = await TutorApplication.findById(id).lean();
  if (!item) notFound();

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <Link className="back-link" href="/admin/tutors">
            ← Tất cả hồ sơ
          </Link>
          <span className="eyebrow">HỒ SƠ GIA SƯ</span>
          <h1>{item.referenceCode}</h1>
          <p>Đã gửi ngày {new Date(item.createdAt).toLocaleString("vi-VN")}</p>
        </div>
        <span className="status-pill large">Chờ kiểm tra</span>
      </div>
      <div className="detail-grid">
        <section className="detail-card">
          <h2>Chuyên môn</h2>
          <dl>
            <div>
              <dt>Nội dung giảng dạy</dt>
              <dd>{list(teachingAreaLabels, item.teachingAreas)}</dd>
            </div>
            <div>
              <dt>Trình độ người học</dt>
              <dd>{list(tutorLevelLabels, item.learnerLevels)}</dd>
            </div>
            <div>
              <dt>Kinh nghiệm</dt>
              <dd>{labelOf(experienceLabels, item.experience)}</dd>
            </div>
            <div>
              <dt>Mô tả kinh nghiệm</dt>
              <dd>{item.experienceNote}</dd>
            </div>
            <div>
              <dt>Chứng chỉ khai báo</dt>
              <dd>{item.certificates || "Không cung cấp"}</dd>
            </div>
            <div>
              <dt>Hình thức</dt>
              <dd>{labelOf(tutorFormatLabels, item.format)}</dd>
            </div>
            <div>
              <dt>Khu vực dạy trực tiếp</dt>
              <dd>{item.area || "Không cung cấp"}</dd>
            </div>
            <div>
              <dt>Khung giờ</dt>
              <dd>{list(slotLabels, item.availabilitySlots)}</dd>
            </div>
            <div>
              <dt>Học phí mong muốn / buổi</dt>
              <dd>
                {item.expectedFee == null
                  ? "Thỏa thuận"
                  : `${Number(item.expectedFee).toLocaleString("vi-VN")} VND`}
              </dd>
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
              <dd>{labelOf(channelLabels, item.preferredChannel)}</dd>
            </div>
            <div>
              <dt>Đồng ý sử dụng dữ liệu</dt>
              <dd>{new Date(item.consentAt).toLocaleString("vi-VN")}</dd>
            </div>
          </dl>
          <p className="detail-note">
            Kiểm tra danh tính, chứng chỉ và kinh nghiệm trước khi giới thiệu
            người học. Không chia sẻ thông tin liên hệ ra ngoài đội ngũ.
          </p>
        </section>
      </div>
    </>
  );
}
