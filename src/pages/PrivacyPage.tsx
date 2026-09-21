import { Link } from 'react-router-dom'
import { usePageMetadata } from '@/hooks/usePageMetadata'

export default function PrivacyPage() {
  usePageMetadata(
    'Chính sách bảo mật | Gia Sư Nhà Mình',
    'Cách Gia Sư Nhà Mình thu thập và sử dụng thông tin trong giai đoạn khảo sát nhu cầu.',
    '/privacy',
  )

  return (
    <article className="mx-auto max-w-3xl px-4 pb-20 pt-28 md:px-8 md:pt-32">
      <p className="mb-3 text-sm font-semibold text-primary">Cập nhật ngày 21/09/2026</p>
      <h1 className="mb-6 text-3xl font-bold text-navy md:text-4xl">Chính sách bảo mật</h1>
      <div className="legal-content">
        <p>
          Gia Sư Nhà Mình hiện là dự án sinh viên đang khảo sát nhu cầu, chưa phải nền tảng gia sư
          chính thức. Chính sách này giải thích cách nhóm sử dụng thông tin bạn tự nguyện cung cấp.
        </p>

        <h2>1. Thông tin được thu thập</h2>
        <p>
          Biểu mẫu có thể thu thập họ tên, nhu cầu học hoặc dạy tiếng Anh, lịch phù hợp, ngân sách,
          khu vực tại Cần Thơ và thông tin liên hệ do bạn nhập.
        </p>

        <h2>2. Mục đích sử dụng</h2>
        <p>
          Nhóm chỉ sử dụng dữ liệu để nghiên cứu nhu cầu, cải thiện ý tưởng sản phẩm và liên hệ về
          chương trình thử nghiệm nếu phù hợp với lựa chọn đồng ý của bạn.
        </p>

        <h2>3. Nơi lưu trữ và bên xử lý dữ liệu</h2>
        <p>
          Trong giai đoạn khảo sát, câu trả lời dự kiến được gửi đến Google Forms. Vì vậy, dữ liệu
          cũng chịu sự điều chỉnh của các điều khoản và chính sách bảo mật của Google.
        </p>

        <h2>4. Chia sẻ và thời gian lưu trữ</h2>
        <p>
          Nhóm không bán dữ liệu cá nhân. Quyền truy cập được giới hạn cho thành viên phụ trách dự
          án. Dữ liệu khảo sát sẽ được rà soát và xóa khi không còn cần thiết cho mục đích nghiên cứu.
        </p>

        <h2>5. Quyền của bạn</h2>
        <p>
          Bạn có thể yêu cầu xem, điều chỉnh hoặc xóa câu trả lời. Kênh tiếp nhận yêu cầu sẽ được công
          bố tại trang này trước khi biểu mẫu chính thức mở nhận dữ liệu.
        </p>

        <h2>6. Thay đổi chính sách</h2>
        <p>
          Chính sách có thể được cập nhật khi dự án chuyển sang giai đoạn thử nghiệm. Ngày cập nhật
          gần nhất luôn được hiển thị ở đầu trang.
        </p>
      </div>
      <Link className="mt-8 inline-flex font-semibold text-primary hover:underline" to="/">
        ← Quay lại trang chủ
      </Link>
    </article>
  )
}
