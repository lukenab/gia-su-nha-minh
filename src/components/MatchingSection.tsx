import Icon, { type IconName } from './Icon'

const criteria: Array<{ icon: IconName; title: string; description: string }> = [
  { icon: 'target', title: 'Mục tiêu học tập', description: 'Giao tiếp, IELTS, phỏng vấn hoặc củng cố nền tảng' },
  { icon: 'level', title: 'Trình độ hiện tại', description: 'Xuất phát điểm và những kỹ năng cần cải thiện' },
  { icon: 'calendar', title: 'Lịch học', description: 'Khung giờ có thể duy trì ổn định giữa hai bên' },
  { icon: 'wallet', title: 'Ngân sách', description: 'Mức học phí người học có thể chủ động lựa chọn' },
  { icon: 'laptop', title: 'Hình thức học', description: 'Online hoặc trực tiếp tại khu vực Cần Thơ' },
  { icon: 'sliders', title: 'Phương pháp', description: 'Cách học phù hợp với mục tiêu và thói quen cá nhân' },
]

export default function MatchingSection() {
  return (
    <section className="bg-navy py-16 text-white md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-28">
            <p className="mb-3 text-sm font-semibold text-[#8FA6FF]">TIÊU CHÍ ĐỐI CHIẾU</p>
            <h2 className="mb-5 text-3xl font-bold tracking-[-0.02em] md:text-4xl">
              Mỗi yêu cầu được xem xét trên nhiều yếu tố thực tế
            </h2>
            <p className="mb-7 text-base leading-relaxed text-white/65 md:text-lg">
              Chuyên môn là điều kiện cần. Một kết nối có thể duy trì còn phụ thuộc vào thời gian, chi phí, hình thức học và phương pháp của gia sư.
            </p>
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
              <Icon name="clock" className="h-5 w-5 text-[#8FA6FF]" />
              Đội ngũ phản hồi yêu cầu trong vòng 24 giờ
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {criteria.map((criterion) => (
              <article key={criterion.title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 transition-colors hover:bg-white/[0.09]">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#A8B7FF]">
                  <Icon name={criterion.icon} />
                </div>
                <h3 className="mb-2 font-bold text-white">{criterion.title}</h3>
                <p className="text-sm leading-relaxed text-white/60">{criterion.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
