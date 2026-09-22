import { Link } from 'react-router-dom'
import { usePageMetadata } from '@/hooks/usePageMetadata'

export default function TermsPage() {
  usePageMetadata(
    'Điều khoản sử dụng | Gia Sư Nhà Mình',
    'Điều khoản sử dụng dịch vụ kết nối người học và gia sư tiếng Anh của Gia Sư Nhà Mình.',
    '/terms',
  )

  return (
    <article className="mx-auto max-w-3xl px-4 pb-20 pt-28 md:px-8 md:pt-32">
      <p className="mb-3 text-sm font-semibold text-primary">Cập nhật ngày 22/09/2026</p>
      <h1 className="mb-6 text-3xl font-bold text-navy md:text-4xl">Điều khoản sử dụng</h1>
      <div className="legal-content">
        <p>
          Khi sử dụng website hoặc gửi biểu mẫu, bạn đồng ý cung cấp thông tin chính xác và tuân thủ
          các điều khoản dưới đây.
        </p>

        <h2>1. Phạm vi website</h2>
        <p>
          Gia Sư Nhà Mình tiếp nhận nhu cầu của sinh viên tại Cần Thơ và hồ sơ gia sư tiếng Anh để
          hỗ trợ kết nối theo mục tiêu, lịch học, ngân sách và hình thức học. Việc hỗ trợ có thể áp
          dụng cho cả học trực tuyến và trực tiếp.
        </p>

        <h2>2. Chi phí và thỏa thuận học</h2>
        <p>
          Gia Sư Nhà Mình hiện không thu phí kết nối. Học phí, lịch học, phương thức thanh toán và
          các điều kiện liên quan do người học và gia sư trao đổi, thống nhất trực tiếp trước khi bắt
          đầu học.
        </p>

        <h2>3. Trách nhiệm của người gửi thông tin</h2>
        <p>
          Bạn cần cung cấp thông tin đúng trong phạm vi cần thiết, không gửi dữ liệu của người khác
          khi chưa có sự đồng ý và không sử dụng biểu mẫu cho mục đích gây hại hoặc phát tán nội dung
          không phù hợp.
        </p>

        <h2>4. Xác minh hồ sơ gia sư</h2>
        <p>
          Gia Sư Nhà Mình kiểm tra thông tin danh tính, chứng chỉ và kinh nghiệm trong phạm vi tài
          liệu gia sư cung cấp. Việc xác minh giúp tăng tính minh bạch nhưng không thay thế đánh giá
          của người học về mức độ phù hợp trước khi quyết định học.
        </p>

        <h2>5. Giới hạn cam kết</h2>
        <p>
          Thời gian phản hồi thông thường là trong vòng 24 giờ kể từ khi nhận đủ thông tin. Gia Sư
          Nhà Mình không cam kết luôn có gia sư đáp ứng mọi tiêu chí, không bảo đảm kết quả học tập
          cụ thể và có thể từ chối yêu cầu thiếu chính xác, không an toàn hoặc vi phạm pháp luật.
        </p>

        <h2>6. Thay đổi hoặc gián đoạn dịch vụ</h2>
        <p>
          Nội dung, biểu mẫu và quy trình hỗ trợ có thể được điều chỉnh để cải thiện chất lượng dịch
          vụ. Những thay đổi quan trọng sẽ được cập nhật trên website.
        </p>
      </div>
      <Link className="mt-8 inline-flex font-semibold text-primary hover:underline" to="/">
        ← Quay lại trang chủ
      </Link>
    </article>
  )
}
