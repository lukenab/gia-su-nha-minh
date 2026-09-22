import Icon, { type IconName } from './Icon'

const checks: Array<{ icon: IconName; title: string; description: string }> = [
  {
    icon: 'identity',
    title: 'Danh tính',
    description: 'Đối chiếu thông tin nhận diện cơ bản trước khi hồ sơ được giới thiệu.',
  },
  {
    icon: 'certificate',
    title: 'Chứng chỉ và chuyên môn',
    description: 'Xem xét tài liệu chứng minh năng lực liên quan đến nội dung đăng ký giảng dạy.',
  },
  {
    icon: 'experience',
    title: 'Kinh nghiệm',
    description: 'Ghi nhận kinh nghiệm giảng dạy, nhóm người học phù hợp và phương pháp tiếp cận.',
  },
]

const profileFields: Array<{ icon: IconName; title: string; description: string }> = [
  { icon: 'book', title: 'Nội dung giảng dạy', description: 'Môn học và kỹ năng gia sư đăng ký' },
  { icon: 'profile', title: 'Nhóm người học phù hợp', description: 'Đối tượng và trình độ có thể hỗ trợ' },
  { icon: 'sliders', title: 'Phương pháp', description: 'Cách tiếp cận và tổ chức buổi học' },
  { icon: 'calendar', title: 'Lịch có thể dạy', description: 'Khung thời gian gia sư còn trống' },
  { icon: 'wallet', title: 'Học phí mong muốn', description: 'Mức phí dự kiến cho mỗi buổi học' },
  { icon: 'laptop', title: 'Hình thức học', description: 'Online, trực tiếp hoặc kết hợp' },
]

export default function TutorProfiles() {
  return (
    <section className="border-b border-edge bg-section py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold text-primary">THÔNG TIN CÓ CƠ SỞ</p>
          <h2 className="mx-auto mb-4 max-w-3xl text-3xl font-bold tracking-[-0.02em] text-navy md:text-4xl">
            Hồ sơ gia sư được kiểm tra trước khi giới thiệu
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate md:text-lg">
            Việc chuẩn hóa và kiểm tra thông tin giúp người học có thêm cơ sở để trao đổi và đưa ra lựa chọn phù hợp.
          </p>
        </div>

        <div className="mb-6 grid gap-5 md:grid-cols-3">
          {checks.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-edge bg-white p-6 shadow-[0_10px_30px_rgba(30,41,59,0.08)]"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-light text-teal">
                <Icon name={item.icon} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-navy">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate">{item.description}</p>
            </article>
          ))}
        </div>

        <div className="overflow-hidden rounded-3xl border border-edge bg-white shadow-[0_16px_42px_rgba(30,41,59,0.1)]">
          <div className="border-b border-edge px-6 py-6 md:px-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                <Icon name="profile" />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-bold text-navy">Thông tin người học nhận được</h3>
                <p className="max-w-2xl text-sm leading-relaxed text-slate">
                  Mỗi hồ sơ được trình bày theo cùng một cấu trúc để việc trao đổi và so sánh trở nên rõ ràng hơn.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3 md:p-8">
            {profileFields.map((field) => (
              <div key={field.title} className="flex items-start gap-3 rounded-2xl border border-edge bg-page p-4">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                  <Icon name={field.icon} className="h-[18px] w-[18px]" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-navy">{field.title}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate">{field.description}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-slate">
          Xác minh thông tin không thay thế việc người học tự trao đổi và đánh giá mức độ phù hợp trước khi bắt đầu học.
        </p>
      </div>
    </section>
  )
}
