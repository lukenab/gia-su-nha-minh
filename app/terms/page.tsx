import type { Metadata } from "next";

import Link from "next/link";

import { LegalPage } from "@/components/landing/legal-page";
import { PRIVACY_HREF, site } from "@/components/landing/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: "Điều khoản sử dụng | Gia Sư Nhà Mình",
  description:
    "Điều khoản sử dụng dịch vụ kết nối người học và gia sư tiếng Anh của Gia Sư Nhà Mình.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Điều khoản sử dụng" updated="21/10/2026">
      <p>
        Khi sử dụng website hoặc gửi biểu mẫu, bạn đồng ý cung cấp thông tin
        chính xác và tuân thủ các điều khoản dưới đây.
      </p>

      <h2>1. Phạm vi dịch vụ</h2>
      <p>
        Gia Sư Nhà Mình tiếp nhận nhu cầu học tiếng Anh của sinh viên tại Cần
        Thơ và thông tin của gia sư tiếng Anh để hỗ trợ kết nối theo mục tiêu,
        lịch học, ngân sách và hình thức học, áp dụng cho cả học trực tuyến và
        trực tiếp.
      </p>

      <h2>2. Học phí và thỏa thuận học</h2>
      <p>
        Học phí, lịch học, phương thức thanh toán và các điều kiện liên quan do
        người học và gia sư trao đổi, thống nhất trực tiếp trước khi bắt đầu
        học. Nếu Gia Sư Nhà Mình áp dụng bất kỳ khoản phí dịch vụ nào, thông tin
        sẽ được thông báo rõ trước khi bạn đồng ý sử dụng.
      </p>

      <h2>3. Trách nhiệm của người gửi thông tin</h2>
      <p>
        Bạn cần cung cấp thông tin đúng trong phạm vi cần thiết, không gửi dữ
        liệu của người khác khi chưa có sự đồng ý và không sử dụng biểu mẫu cho
        mục đích gây hại hoặc phát tán nội dung không phù hợp.
      </p>

      <h2>4. Kiểm tra hồ sơ gia sư</h2>
      <p>
        Gia Sư Nhà Mình kiểm tra thông tin danh tính, chứng chỉ và kinh nghiệm
        trong phạm vi tài liệu gia sư cung cấp. Việc kiểm tra giúp tăng tính
        minh bạch nhưng không thay thế đánh giá của người học về mức độ phù hợp
        trước khi quyết định học.
      </p>

      <h2>5. Giới hạn cam kết</h2>
      <p>
        Thời gian phản hồi thông thường là trong vòng 24 giờ kể từ khi nhận đủ
        thông tin. Gia Sư Nhà Mình không cam kết luôn có gia sư đáp ứng mọi tiêu
        chí, không bảo đảm kết quả học tập cụ thể và có thể từ chối yêu cầu
        thiếu chính xác, không an toàn hoặc vi phạm pháp luật.
      </p>

      <h2>6. Thay đổi hoặc gián đoạn dịch vụ</h2>
      <p>
        Nội dung, biểu mẫu và quy trình hỗ trợ có thể được điều chỉnh để cải
        thiện chất lượng dịch vụ. Những thay đổi quan trọng sẽ được cập nhật
        trên website. Cách chúng tôi xử lý dữ liệu được trình bày trong{" "}
        <Link href={PRIVACY_HREF}>Chính sách bảo mật</Link>. Mọi thắc mắc, vui
        lòng liên hệ{" "}
        <a href={site.facebookUrl} target="_blank" rel="noopener noreferrer">
          fanpage Gia Sư Nhà Mình
        </a>
        .
      </p>
    </LegalPage>
  );
}
