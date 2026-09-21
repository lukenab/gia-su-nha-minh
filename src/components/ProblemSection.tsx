const problems = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#4361EE" strokeWidth="2" />
        <path d="M9 9h.01M15 9h.01M9 14s1.5 2 3 2 3-2 3-2" stroke="#4361EE" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="#4361EE" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      </svg>
    ),
    title: 'Khó đánh giá mức độ phù hợp',
    desc: 'Hồ sơ thường liệt kê bằng cấp và kinh nghiệm nhưng chưa thể hiện rõ gia sư phù hợp với mục tiêu học tập nào.',
    bg: 'bg-primary-light',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#0D9488" strokeWidth="2" />
        <path d="M8 12h8M8 8h4M8 16h6" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Mất thời gian trao đổi',
    desc: 'Người học phải hỏi lại nhiều lần về lịch trống, hình thức học, học phí và phương pháp giảng dạy.',
    bg: 'bg-teal-light',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#F97316" strokeWidth="2" />
        <path d="M12 7v5l3 3" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Nhu cầu chưa được mô tả rõ',
    desc: 'Nhiều người chỉ bắt đầu từ tên môn học, trong khi mục tiêu thực tế có thể là giao tiếp, phỏng vấn hoặc củng cố kiến thức.',
    bg: 'bg-orange-light',
  },
]

export default function ProblemSection() {
  return (
    <section className="py-16 md:py-24 bg-section">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-navy mb-4">
            Tìm được gia sư chưa chắc đã tìm được{' '}
            <span className="text-primary">người phù hợp</span>
          </h2>
          <p className="text-slate text-base md:text-lg max-w-2xl mx-auto">
            Những khó khăn sinh viên tại Cần Thơ có thể gặp khi tìm gia sư tiếng Anh theo cách truyền thống.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((p) => (
            <div key={p.title} className="bg-surface rounded-2xl border border-edge p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl ${p.bg} flex items-center justify-center mb-4`}>
                {p.icon}
              </div>
              <h3 className="font-bold text-navy text-lg mb-2">{p.title}</h3>
              <p className="text-slate text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
