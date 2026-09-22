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

const profileFields = ['Nội dung giảng dạy', 'Nhóm người học phù hợp', 'Phương pháp', 'Lịch có thể dạy', 'Học phí mong muốn', 'Hình thức học']

export default function TutorProfiles() {
  return (
    <section className="bg-section py-16 md:py-24">
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
            <article key={item.title} className="rounded-2xl border border-edge bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-light text-teal">
                <Icon name={item.icon} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-navy">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate">{item.description}</p>
            </article>
          ))}
        </div>

        <div className="grid gap-6 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-[0.85fr_1.15fr] md:p-8">
          <div>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
              <Icon name="profile" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-navy">Thông tin người học nhận được</h3>
            <p className="text-sm leading-relaxed text-slate">
              Mỗi hồ sơ được trình bày theo cùng một cấu trúc để việc trao đổi và so sánh trở nên rõ ràng hơn.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {profileFields.map((field) => (
              <div key={field} className="flex items-center gap-3 rounded-xl border border-edge bg-page px-4 py-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-light text-teal">
                  <Icon name="check" className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-navy">{field}</span>
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
