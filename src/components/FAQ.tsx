import { useState } from 'react'

const faqs = [
  {
    q: 'Gia Sư Nhà Mình đã chính thức hoạt động chưa?',
    a: 'Hiện tại, Gia Sư Nhà Mình đang trong giai đoạn nghiên cứu nhu cầu người dùng và chưa chính thức hoạt động như một nền tảng kết nối gia sư. Chúng tôi đang thu thập thông tin để hiểu rõ hơn những khó khăn thực tế của người học và gia sư trước khi phát triển sản phẩm.',
  },
  {
    q: 'Việc đăng ký quan tâm có mất phí không?',
    a: 'Hoàn toàn miễn phí. Đăng ký quan tâm chỉ là cách bạn cho chúng tôi biết nhu cầu của bạn và nhận thông báo khi chương trình thử nghiệm bắt đầu. Không có bất kỳ khoản phí nào được thu trong giai đoạn này.',
  },
  {
    q: 'Sau khi gửi thông tin, tôi có được kết nối ngay không?',
    a: 'Chưa. Hiện tại chúng tôi chưa có tính năng kết nối tự động. Thông tin bạn cung cấp sẽ được sử dụng cho hoạt động khảo sát và chúng tôi sẽ liên hệ lại khi có chương trình thử nghiệm phù hợp.',
  },
  {
    q: 'Thông tin tôi cung cấp được sử dụng như thế nào?',
    a: 'Thông tin bạn chia sẻ được sử dụng hoàn toàn cho mục đích nghiên cứu nhu cầu người dùng — để chúng tôi hiểu rõ hơn những khó khăn và tiêu chí quan trọng khi tìm gia sư. Thông tin không được chia sẻ với bên thứ ba và sẽ chỉ được dùng để liên lạc trong khuôn khổ dự án này.',
  },
  {
    q: 'Hiện tại dự án hỗ trợ những môn học nào?',
    a: 'Giai đoạn nghiên cứu ban đầu tập trung vào nhu cầu học Tiếng Anh của sinh viên đại học. Tuy nhiên, chúng tôi quan tâm đến nhu cầu đa dạng và khuyến khích bạn chia sẻ nhu cầu của mình dù bạn đang học môn gì.',
  },
  {
    q: 'Gia sư được lựa chọn hoặc kiểm tra thông tin ra sao?',
    a: 'Quy trình xác minh thông tin gia sư đang được nghiên cứu và phát triển. Chúng tôi chưa có quy trình kiểm tra chính thức trong giai đoạn này và không xác nhận rằng bất kỳ gia sư nào đã được kiểm chứng. Quy trình này sẽ được công bố rõ ràng khi nền tảng chính thức ra mắt.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-16 md:py-24 bg-section">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-navy mb-4">
            Câu hỏi thường gặp
          </h2>
          <p className="text-slate text-base md:text-lg">
            Những thắc mắc phổ biến về Gia Sư Nhà Mình và cách hoạt động.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-surface rounded-2xl border border-edge overflow-hidden shadow-sm"
            >
              <button
                className="w-full flex items-start justify-between gap-4 p-5 text-left hover:bg-page transition-colors"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                <span className="font-semibold text-navy text-base leading-snug">{faq.q}</span>
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center transition-transform duration-200 mt-0.5 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4l4 4 4-4" stroke="#4361EE" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5">
                  <p className="text-slate text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
