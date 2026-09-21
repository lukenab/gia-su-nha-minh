import { Link } from 'react-router-dom'
import { usePageMetadata } from '@/hooks/usePageMetadata'

export default function TermsPage() {
  usePageMetadata(
    'Điều khoản sử dụng | Gia Sư Nhà Mình',
    'Điều khoản sử dụng website Gia Sư Nhà Mình trong giai đoạn khảo sát nhu cầu.',
    '/terms',
  )

  return (
    <article className="mx-auto max-w-3xl px-4 pb-20 pt-28 md:px-8 md:pt-32">
      <p className="mb-3 text-sm font-semibold text-primary">Cập nhật ngày 21/09/2026</p>
      <h1 className="mb-6 text-3xl font-bold text-navy md:text-4xl">Điều khoản sử dụng</h1>
      <div className="legal-content">
        <p>
          Khi sử dụng website, bạn xác nhận đã hiểu rằng Gia Sư Nhà Mình đang ở giai đoạn nghiên cứu
          nhu cầu và chưa cung cấp dịch vụ kết nối gia sư chính thức.
        </p>

        <h2>1. Phạm vi website</h2>
        <p>
          Nội dung hiện tại dùng để giới thiệu ý tưởng và thu thập đăng ký quan tâm từ sinh viên tại
          Cần Thơ và gia sư tiếng Anh tiềm năng.
        </p>

        <h2>2. Nội dung minh họa</h2>
        <p>
          Hồ sơ gia sư, mức học phí và tình huống so khớp trên website đều được ghi rõ là minh họa.
          Chúng không phải cam kết về gia sư đang hoạt động hoặc kết quả học tập.
        </p>

        <h2>3. Trách nhiệm của người gửi thông tin</h2>
        <p>
          Bạn cần cung cấp thông tin đúng trong phạm vi cần thiết, không gửi dữ liệu của người khác
          khi chưa có sự đồng ý và không sử dụng biểu mẫu cho mục đích gây hại hoặc phát tán nội dung
          không phù hợp.
        </p>

        <h2>4. Thay đổi và gián đoạn</h2>
        <p>
          Nhóm có thể điều chỉnh nội dung, tạm dừng biểu mẫu hoặc thay đổi phạm vi thử nghiệm trong
          quá trình xác thực ý tưởng. Những thay đổi quan trọng sẽ được cập nhật trên website.
        </p>

        <h2>5. Giới hạn cam kết</h2>
        <p>
          Việc đăng ký quan tâm không đảm bảo rằng người dùng sẽ được kết nối ngay, được chọn tham gia
          thử nghiệm hoặc nhận một mức học phí cụ thể.
        </p>
      </div>
      <Link className="mt-8 inline-flex font-semibold text-primary hover:underline" to="/">
        ← Quay lại trang chủ
      </Link>
    </article>
  )
}
