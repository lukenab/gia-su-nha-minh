import { useState } from 'react'

const faqs = [
  {
    question: 'Gia Sư Nhà Mình hỗ trợ những nội dung tiếng Anh nào?',
    answer: 'Dịch vụ hiện tập trung vào nhu cầu tiếng Anh của sinh viên tại Cần Thơ, gồm tiếng Anh nền tảng, giao tiếp, phỏng vấn, IELTS và các mục tiêu học tập cụ thể khác.',
  },
  {
    question: 'Sau khi gửi yêu cầu, bao lâu tôi nhận được phản hồi?',
    answer: 'Đội ngũ sẽ tiếp nhận và phản hồi trong vòng 24 giờ. Thời gian giới thiệu được gia sư phù hợp có thể khác nhau tùy mục tiêu, lịch học và ngân sách của bạn.',
  },
  {
    question: 'Dịch vụ có hỗ trợ học online và trực tiếp không?',
    answer: 'Có. Bạn có thể chọn học online, học trực tiếp tại khu vực Cần Thơ hoặc linh hoạt giữa hai hình thức khi gửi yêu cầu.',
  },
  {
    question: 'Tôi có phải trả phí kết nối không?',
    answer: 'Hiện tại Gia Sư Nhà Mình chưa thu phí kết nối. Học phí được người học và gia sư trao đổi, thống nhất trực tiếp trước khi bắt đầu học.',
  },
  {
    question: 'Thông tin gia sư được kiểm tra như thế nào?',
    answer: 'Trước khi giới thiệu hồ sơ, đội ngũ kiểm tra thông tin danh tính, chứng chỉ liên quan và kinh nghiệm do gia sư cung cấp. Người học vẫn nên trao đổi trực tiếp để tự đánh giá mức độ phù hợp.',
  },
  {
    question: 'Thông tin tôi gửi được sử dụng cho mục đích gì?',
    answer: 'Thông tin được sử dụng để xử lý yêu cầu kết nối, liên hệ với bạn và hỗ trợ quá trình lựa chọn gia sư. Chi tiết được trình bày trong Chính sách bảo mật.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="border-t border-edge bg-section pb-16 pt-12 md:pb-24 md:pt-16">
      <div className="mx-auto max-w-3xl px-4 md:px-8">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold text-primary">THÔNG TIN CẦN BIẾT</p>
          <h2 className="mb-4 text-3xl font-bold tracking-[-0.02em] text-navy md:text-4xl">Câu hỏi thường gặp</h2>
          <p className="text-base text-slate md:text-lg">Các thông tin quan trọng trước khi bạn gửi yêu cầu.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <article
              key={faq.question}
              className="overflow-hidden rounded-2xl border border-edge bg-white shadow-[0_6px_20px_rgba(30,41,59,0.06)]"
            >
              <button
                id={`faq-button-${index}`}
                className="flex w-full items-start justify-between gap-4 p-5 text-left transition-colors hover:bg-page"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-panel-${index}`}
              >
                <span className="font-semibold leading-snug text-navy">{faq.question}</span>
                <span className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-light text-primary transition-transform ${openIndex === index ? 'rotate-180' : ''}`} aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </button>
              {openIndex === index && (
                <div id={`faq-panel-${index}`} role="region" aria-labelledby={`faq-button-${index}`} className="px-5 pb-5">
                  <p className="text-sm leading-relaxed text-slate">{faq.answer}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
