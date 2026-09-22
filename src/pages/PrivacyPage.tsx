import { Link } from 'react-router-dom'
import { usePageMetadata } from '@/hooks/usePageMetadata'
import { siteConfig } from '@/lib/config'

export default function PrivacyPage() {
  usePageMetadata(
    'Chính sách bảo mật | Gia Sư Nhà Mình',
    'Cách Gia Sư Nhà Mình thu thập, sử dụng và bảo vệ thông tin của người học và gia sư.',
    '/privacy',
  )

  return (
    <article className="mx-auto max-w-3xl px-4 pb-20 pt-28 md:px-8 md:pt-32">
      <p className="mb-3 text-sm font-semibold text-primary">Cập nhật ngày 22/09/2026</p>
      <h1 className="mb-6 text-3xl font-bold text-navy md:text-4xl">Chính sách bảo mật</h1>
      <div className="legal-content">
        <p>
          Chính sách này giải thích cách Gia Sư Nhà Mình tiếp nhận, sử dụng và bảo vệ thông tin bạn
          cung cấp khi gửi yêu cầu tìm gia sư hoặc đăng ký trở thành gia sư.
        </p>

        <h2>1. Thông tin được thu thập</h2>
        <p>
          Biểu mẫu có thể thu thập họ tên, nhu cầu học hoặc dạy tiếng Anh, lịch phù hợp, ngân sách,
          khu vực tại Cần Thơ và thông tin liên hệ do bạn nhập.
        </p>

        <h2>2. Mục đích sử dụng</h2>
        <p>
          Thông tin được sử dụng để liên hệ, xác nhận nhu cầu, kiểm tra hồ sơ gia sư và hỗ trợ kết
          nối giữa hai bên. Gia Sư Nhà Mình chỉ xử lý dữ liệu trong phạm vi cần thiết cho các mục
          đích này.
        </p>

        <h2>3. Nơi lưu trữ và bên xử lý dữ liệu</h2>
        <p>
          Câu trả lời từ biểu mẫu có thể được chuyển đến và lưu trữ bằng Google Forms. Việc xử lý
          dữ liệu trên dịch vụ này đồng thời chịu sự điều chỉnh của chính sách bảo mật của Google.
        </p>

        <h2>4. Chia sẻ và thời gian lưu trữ</h2>
        <p>
          Gia Sư Nhà Mình không bán dữ liệu cá nhân. Quyền truy cập được giới hạn cho thành viên phụ
          trách việc xác minh và kết nối. Dữ liệu được lưu trong thời gian cần thiết để xử lý yêu cầu
          và sẽ được rà soát, xóa khi không còn phục vụ mục đích đã nêu.
        </p>

        <h2>5. Quyền của bạn</h2>
        <p>
          Bạn có thể yêu cầu xem, điều chỉnh hoặc xóa thông tin đã cung cấp bằng cách liên hệ qua{' '}
          <a href={siteConfig.facebookUrl} target="_blank" rel="noreferrer">
            Facebook chính thức của Gia Sư Nhà Mình
          </a>
          .
        </p>

        <h2>6. Thay đổi chính sách</h2>
        <p>
          Chính sách có thể được cập nhật để phản ánh thay đổi trong quy trình vận hành hoặc yêu cầu
          pháp lý. Ngày cập nhật gần nhất luôn được hiển thị ở đầu trang.
        </p>
      </div>
      <Link className="mt-8 inline-flex font-semibold text-primary hover:underline" to="/">
        ← Quay lại trang chủ
      </Link>
    </article>
  )
}
