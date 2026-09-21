import { useFormContext } from '@/context/FormModalContext'

function HeroMockup() {
  return (
    <div className="relative w-full max-w-sm mx-auto lg:mx-0">
      {/* Illustration label */}
      <div className="absolute -top-6 right-0 text-xs text-slate italic font-medium">Minh họa</div>

      {/* Learner request card */}
      <div className="bg-white rounded-2xl border border-edge shadow-md p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="6" r="3" stroke="#4361EE" strokeWidth="1.5" />
              <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#4361EE" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-slate font-medium">Người học</div>
            <div className="text-sm font-semibold text-navy">Minh Anh, sinh viên năm 3</div>
          </div>
        </div>
        <div className="text-xs text-slate font-semibold uppercase tracking-wide mb-3">Nhu cầu của tôi</div>
        <div className="space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-primary-light flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L8.5 5.5H13L9.5 8L11 12.5L7 10L3 12.5L4.5 8L1 5.5H5.5L7 1Z" fill="#4361EE" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] text-slate">Mục tiêu</div>
              <div className="text-sm font-medium text-navy">Luyện giao tiếp để phỏng vấn thực tập</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-teal-light flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="2" width="12" height="11" rx="2" stroke="#0D9488" strokeWidth="1.5" />
                <path d="M1 6h12" stroke="#0D9488" strokeWidth="1.5" />
                <path d="M4 1v2M10 1v2" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] text-slate">Lịch học</div>
              <div className="text-sm font-medium text-navy">Tối thứ Ba và thứ Năm</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-orange-light flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="#F97316" strokeWidth="1.5" />
                <path d="M7 4v6M5 5.5h3a1 1 0 010 2H6a1 1 0 010 2h3" stroke="#F97316" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] text-slate">Ngân sách</div>
              <div className="text-sm font-medium text-navy">150.000 – 200.000đ / buổi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Connection indicator */}
      <div className="flex flex-col items-center my-2">
        <div className="w-0.5 h-4 bg-edge" />
        <div className="bg-primary text-white text-[10px] font-semibold px-3 py-1 rounded-full">
          Kết nối phù hợp
        </div>
        <div className="w-0.5 h-4 bg-edge" />
      </div>

      {/* Tutor match card */}
      <div className="bg-white rounded-2xl border-2 border-primary/30 shadow-md p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-teal flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            TH
          </div>
          <div>
            <div className="text-sm font-bold text-navy">Nguyễn Thu H.</div>
            <div className="text-xs text-slate">Gia sư Tiếng Anh giao tiếp</div>
          </div>
          <div className="ml-auto">
            <span className="text-xs bg-teal-light text-teal px-2 py-1 rounded-full font-medium">Online</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[11px] bg-primary-light text-primary px-2.5 py-1 rounded-full font-medium">Giao tiếp</span>
          <span className="text-[11px] bg-teal-light text-teal px-2.5 py-1 rounded-full font-medium">IELTS 7.5</span>
          <span className="text-[11px] bg-orange-light text-orange px-2.5 py-1 rounded-full font-medium">150–200k/buổi</span>
          <span className="text-[11px] bg-primary-light text-primary px-2.5 py-1 rounded-full font-medium">Tối T3, T5</span>
        </div>
        <div className="mt-3 text-[10px] text-slate italic border-t border-edge pt-2">
          Hồ sơ minh họa — chưa phải gia sư đang hoạt động
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  const { openLearnerForm, openTutorForm } = useFormContext()

  return (
    <section className="pt-28 pb-16 md:pt-32 md:pb-24 bg-page">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: copy */}
          <div>
            {/* Status badge */}
            <div className="inline-flex items-center gap-2 bg-orange-light text-orange text-xs font-semibold px-3.5 py-2 rounded-full mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange" />
              </span>
              Đang khảo sát nhu cầu người dùng
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy leading-tight mb-5">
              Tìm gia sư phù hợp với{' '}
              <span className="text-primary">mục tiêu học tập</span> của bạn
            </h1>

            <p className="text-slate text-base md:text-lg leading-relaxed mb-8">
              Gia Sư Nhà Mình đang phát triển cách kết nối sinh viên tại Cần Thơ với gia sư tiếng Anh dựa trên mục tiêu, lịch học và ngân sách — thay vì chỉ lựa chọn từ một danh sách hồ sơ chung.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <button
                onClick={() => openLearnerForm()}
                className="bg-primary text-white font-bold px-7 py-3.5 rounded-xl hover:bg-primary-dark transition-colors text-base"
              >
                Tôi muốn tìm gia sư
              </button>
              <button
                onClick={openTutorForm}
                className="border-2 border-primary text-primary font-bold px-7 py-3.5 rounded-xl hover:bg-primary-light transition-colors text-base"
              >
                Tôi muốn trở thành gia sư
              </button>
            </div>

            <p className="text-sm text-slate">
              Đăng ký để tham gia khảo sát và nhận thông tin khi chương trình thử nghiệm bắt đầu.
            </p>
          </div>

          {/* Right: visual mockup */}
          <div className="flex justify-center lg:justify-end mt-8 lg:mt-0">
            <HeroMockup />
          </div>
        </div>
      </div>
    </section>
  )
}
