const criteria = [
  { label: 'Mục tiêu học tập', color: 'bg-primary-light text-primary border-primary/30', icon: '🎯' },
  { label: 'Trình độ hiện tại', color: 'bg-teal-light text-teal border-teal/30', icon: '📊' },
  { label: 'Lịch có thể học', color: 'bg-orange-light text-orange border-orange/30', icon: '📅' },
  { label: 'Ngân sách dự kiến', color: 'bg-primary-light text-primary border-primary/30', icon: '💰' },
  { label: 'Hình thức học', color: 'bg-teal-light text-teal border-teal/30', icon: '💻' },
  { label: 'Phương pháp mong muốn', color: 'bg-orange-light text-orange border-orange/30', icon: '✏️' },
]

export default function MatchingSection() {
  return (
    <section className="py-16 md:py-24 bg-page">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-navy mb-4">
            Không chỉ tìm theo <span className="text-primary">tên môn học</span>
          </h2>
          <p className="text-slate text-base md:text-lg max-w-2xl mx-auto">
            Gia Sư Nhà Mình dự kiến đối chiếu nhiều tiêu chí thực tế để đề xuất hồ sơ phù hợp hơn.
          </p>
        </div>

        {/* Criteria chips */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {criteria.map((c) => (
            <div
              key={c.label}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm ${c.color}`}
            >
              <span>{c.icon}</span>
              {c.label}
            </div>
          ))}
        </div>

        {/* Example match */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Learner request */}
          <div className="bg-white rounded-2xl border border-edge shadow-sm p-6">
            <div className="text-xs font-semibold text-slate uppercase tracking-wide mb-4">
              Ví dụ: yêu cầu người học
            </div>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="6" r="3.5" stroke="#4361EE" strokeWidth="1.5" />
                  <path d="M2 17c0-3.9 3.1-7 7-7s7 3.1 7 7" stroke="#4361EE" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-navy text-sm">Sinh viên đại học</div>
                <p className="text-sm text-slate mt-1 leading-relaxed">
                  "Sinh viên cần luyện tiếng Anh để chuẩn bị phỏng vấn thực tập, có thể học vào tối thứ Ba và thứ Năm."
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { k: 'Mục tiêu', v: 'Phỏng vấn thực tập', c: 'bg-primary-light text-primary' },
                { k: 'Lịch học', v: 'Tối T3 & T5', c: 'bg-teal-light text-teal' },
                { k: 'Ngân sách', v: '150k – 200k/buổi', c: 'bg-orange-light text-orange' },
                { k: 'Hình thức', v: 'Linh hoạt', c: 'bg-primary-light text-primary' },
              ].map((item) => (
                <div key={item.k} className="flex items-center justify-between text-sm">
                  <span className="text-slate">{item.k}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${item.c}`}>{item.v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tutor profile */}
          <div className="bg-white rounded-2xl border-2 border-primary/25 shadow-sm p-6 relative">
            <div className="absolute -top-3 right-4 bg-primary text-white text-[10px] font-semibold px-3 py-1 rounded-full">
              Phù hợp
            </div>
            <div className="text-xs font-semibold text-slate uppercase tracking-wide mb-4">
              Hồ sơ minh họa — chưa phải gia sư đang hoạt động trên nền tảng
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-teal flex items-center justify-center text-white font-bold text-sm">
                TH
              </div>
              <div>
                <div className="font-bold text-navy">Nguyễn Thu H.</div>
                <div className="text-xs text-teal font-medium">Gia sư Tiếng Anh giao tiếp</div>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { k: 'Chuyên môn', v: 'Giao tiếp, phỏng vấn', c: 'bg-primary-light text-primary' },
                { k: 'Lịch dạy', v: 'Tối T2, T3, T5', c: 'bg-teal-light text-teal' },
                { k: 'Học phí', v: '150k – 200k/buổi', c: 'bg-orange-light text-orange' },
                { k: 'Hình thức', v: 'Online & trực tiếp', c: 'bg-primary-light text-primary' },
              ].map((item) => (
                <div key={item.k} className="flex items-center justify-between text-sm">
                  <span className="text-slate">{item.k}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${item.c}`}>{item.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
