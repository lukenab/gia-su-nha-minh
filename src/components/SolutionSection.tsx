import Icon from './Icon'

const values = [
  {
    icon: 'message' as const,
    title: 'Tiếp nhận nhu cầu cụ thể',
    description: 'Mục tiêu, trình độ, lịch học, ngân sách và hình thức học được ghi nhận ngay từ đầu.',
  },
  {
    icon: 'search' as const,
    title: 'Đối chiếu bởi đội ngũ',
    description: 'Chúng tôi xem xét từng yêu cầu và tìm trong nguồn gia sư có điều kiện phù hợp.',
  },
  {
    icon: 'shield' as const,
    title: 'Thông tin gia sư có cơ sở',
    description: 'Danh tính, chứng chỉ và kinh nghiệm được kiểm tra trước khi hồ sơ được giới thiệu.',
  },
]

export default function SolutionSection() {
  return (
    <section className="border-b border-edge bg-section py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold text-primary">CÁCH GIA SƯ NHÀ MÌNH HỖ TRỢ</p>
          <h2 className="mx-auto mb-4 max-w-3xl text-3xl font-bold tracking-[-0.02em] text-navy md:text-4xl">
            Từ nhu cầu học tập đến lựa chọn phù hợp, rõ ràng ở từng bước
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate md:text-lg">
            Thay vì để người học tự tìm kiếm và hỏi lại từng thông tin, đội ngũ hỗ trợ thu hẹp lựa chọn theo các tiêu chí đã thống nhất.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {values.map((item, index) => (
            <article
              key={item.title}
              className="relative rounded-2xl border border-edge bg-white p-7 shadow-[0_10px_30px_rgba(30,41,59,0.08)]"
            >
              <span className="absolute right-6 top-6 text-sm font-bold text-primary/30">0{index + 1}</span>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-white">
                <Icon name={item.icon} />
              </div>
              <h3 className="mb-3 text-lg font-bold text-navy">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
