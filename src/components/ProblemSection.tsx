import Icon from './Icon'

const challenges = [
  {
    icon: 'target' as const,
    title: 'Mục tiêu học tập khác nhau',
    description: 'Giao tiếp, phỏng vấn, IELTS hay củng cố nền tảng đều cần cách dạy và kinh nghiệm phù hợp.',
  },
  {
    icon: 'calendar' as const,
    title: 'Điều kiện học cần tương thích',
    description: 'Lịch học, ngân sách, khu vực và hình thức online hoặc trực tiếp ảnh hưởng trực tiếp đến khả năng duy trì.',
  },
  {
    icon: 'profile' as const,
    title: 'Thông tin cần rõ ràng',
    description: 'Người học cần hiểu chuyên môn, kinh nghiệm và phương pháp của gia sư trước khi lựa chọn.',
  },
]

export default function ProblemSection() {
  return (
    <section className="border-b border-edge bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-12 max-w-3xl">
          <p className="mb-3 text-sm font-semibold text-primary">BẮT ĐẦU TỪ SỰ PHÙ HỢP</p>
          <h2 className="mb-4 text-3xl font-bold tracking-[-0.02em] text-navy md:text-4xl">
            Tìm gia sư hiệu quả cần nhiều hơn một danh sách hồ sơ
          </h2>
          <p className="text-base leading-relaxed text-slate md:text-lg">
            Một kết nối tốt cần đồng thời đáp ứng mục tiêu học tập và các điều kiện thực tế của cả người học lẫn gia sư.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {challenges.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-edge bg-white p-6 shadow-[0_10px_30px_rgba(30,41,59,0.08)]"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
                <Icon name={item.icon} />
              </div>
              <h3 className="mb-2 text-lg font-bold text-navy">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
