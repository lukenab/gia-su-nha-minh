const solutions = [
  {
    number: '01',
    title: 'Bắt đầu từ mục tiêu học tập',
    desc: 'Dự kiến hỗ trợ người học xác định rõ mục tiêu — luyện giao tiếp, chuẩn bị phỏng vấn, củng cố nền tảng hoặc cải thiện một kỹ năng cụ thể.',
    color: 'text-primary',
    border: 'border-primary/20',
    numBg: 'bg-primary-light text-primary',
    accent: 'bg-primary',
  },
  {
    number: '02',
    title: 'So khớp điều kiện thực tế',
    desc: 'Hướng tới so sánh lịch trống, ngân sách dự kiến, hình thức online hoặc trực tiếp và khu vực địa lý để đề xuất những hồ sơ thực sự phù hợp.',
    color: 'text-teal',
    border: 'border-teal/20',
    numBg: 'bg-teal-light text-teal',
    accent: 'bg-teal',
  },
  {
    number: '03',
    title: 'Hồ sơ gia sư có cấu trúc',
    desc: 'Đang phát triển định dạng hồ sơ thống nhất — môn dạy, nhóm người học phù hợp, kinh nghiệm, phương pháp, mức học phí và lịch dạy — để người học dễ so sánh.',
    color: 'text-orange',
    border: 'border-orange/20',
    numBg: 'bg-orange-light text-orange',
    accent: 'bg-orange',
  },
]

export default function SolutionSection() {
  return (
    <section className="py-16 md:py-24 bg-page">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <div className="inline-block text-xs font-semibold text-primary bg-primary-light px-3 py-1.5 rounded-full mb-4 uppercase tracking-wide">
            Đề xuất của chúng tôi
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-navy mb-4">
            Gia Sư Nhà Mình đang đề xuất một cách{' '}
            <span className="text-primary">kết nối rõ ràng hơn</span>
          </h2>
          <p className="text-slate text-base md:text-lg max-w-2xl mx-auto">
            Nền tảng đang trong giai đoạn nghiên cứu và phát triển. Dưới đây là hướng tiếp cận chúng tôi đang xây dựng.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {solutions.map((s) => (
            <div
              key={s.number}
              className={`bg-surface rounded-2xl border-2 ${s.border} p-6 shadow-sm relative overflow-hidden`}
            >
              <div className={`absolute top-0 left-0 w-1 h-full ${s.accent} rounded-l-2xl`} />
              <div className={`inline-block text-sm font-black px-3 py-1 rounded-lg ${s.numBg} mb-4`}>
                {s.number}
              </div>
              <h3 className={`font-bold text-lg mb-3 ${s.color}`}>{s.title}</h3>
              <p className="text-slate text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
