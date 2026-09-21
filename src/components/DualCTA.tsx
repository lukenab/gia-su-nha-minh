import { useFormContext } from '../App'

export default function DualCTA() {
  const { openLearnerForm, openTutorForm } = useFormContext()

  return (
    <section className="py-16 md:py-24 bg-page">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-navy mb-4">
            Bạn muốn đồng hành cùng Gia Sư Nhà Mình{' '}
            <span className="text-primary">theo cách nào?</span>
          </h2>
          <p className="text-slate text-base md:text-lg">
            Chia sẻ nhu cầu của bạn để giúp chúng tôi hiểu rõ hơn và xây dựng nền tảng phù hợp.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Learner card */}
          <div className="bg-surface rounded-2xl border-2 border-primary/20 p-7 shadow-sm text-center hover:border-primary/40 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="9" r="5" stroke="#4361EE" strokeWidth="2" />
                <path d="M4 25c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="#4361EE" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="font-bold text-navy text-xl mb-3">Tôi đang cần tìm gia sư</h3>
            <p className="text-slate text-sm leading-relaxed mb-6">
              Chia sẻ nhu cầu học tập để nhóm hiểu rõ hơn những khó khăn và tiêu chí bạn quan tâm.
            </p>
            <button
              onClick={() => openLearnerForm()}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-dark transition-colors"
            >
              Đăng ký nhu cầu học
            </button>
          </div>

          {/* Tutor card */}
          <div className="bg-surface rounded-2xl border-2 border-teal/20 p-7 shadow-sm text-center hover:border-teal/40 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-teal-light flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="4" y="7" width="20" height="16" rx="3" stroke="#0D9488" strokeWidth="2" />
                <path d="M4 12h20" stroke="#0D9488" strokeWidth="2" />
                <path d="M9 7V5M19 7V5" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
                <path d="M9 17h10M9 20h6" stroke="#0D9488" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="font-bold text-navy text-xl mb-3">Tôi muốn trở thành gia sư</h3>
            <p className="text-slate text-sm leading-relaxed mb-6">
              Chia sẻ kinh nghiệm, môn dạy và mong muốn của bạn khi tìm kiếm học viên.
            </p>
            <button
              onClick={openTutorForm}
              className="w-full bg-teal text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-opacity"
            >
              Đăng ký làm gia sư
            </button>
          </div>
        </div>

        {/* Parent link */}
        <div className="text-center">
          <button
            onClick={() => openLearnerForm('Phụ huynh')}
            className="text-sm text-slate underline underline-offset-4 hover:text-primary transition-colors"
          >
            Tôi là phụ huynh đang tìm gia sư →
          </button>
        </div>
      </div>
    </section>
  )
}
