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

export default function TutorProfiles() {
  return (
    <section className="border-b border-edge bg-section py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold text-primary">THÔNG TIN CÓ CƠ SỞ</p>
          <h2 className="mx-auto mb-4 max-w-4xl text-3xl font-bold tracking-[-0.02em] text-navy md:text-4xl">
            Hồ sơ gia sư được kiểm tra trước khi giới thiệu
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate md:text-lg">
            Việc chuẩn hóa và kiểm tra thông tin giúp người học có thêm cơ sở để trao đổi và đưa ra lựa chọn phù hợp.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
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

        <p className="mt-5 text-center text-xs leading-relaxed text-slate">
          Xác minh thông tin không thay thế việc người học tự trao đổi và đánh giá mức độ phù hợp trước khi bắt đầu học.
        </p>
      </div>
    </section>
  )
}
