import { useState } from 'react'

const learnerSteps = [
  {
    step: 1,
    title: 'Chia sẻ mục tiêu học tập',
    desc: 'Cho chúng tôi biết bạn muốn đạt được điều gì — giao tiếp tốt hơn, vượt kỳ thi, hay chuẩn bị cho phỏng vấn thực tập.',
  },
  {
    step: 2,
    title: 'Cung cấp lịch học và ngân sách dự kiến',
    desc: 'Nêu rõ khung thời gian bạn có thể học và mức học phí mà bạn kỳ vọng để hệ thống tìm những gia sư phù hợp nhất.',
  },
  {
    step: 3,
    title: 'Tham khảo các hồ sơ phù hợp',
    desc: 'Xem qua các hồ sơ gia sư được đề xuất dựa trên mục tiêu, lịch học và ngân sách của bạn.',
  },
  {
    step: 4,
    title: 'Kết nối và trao đổi trước khi quyết định',
    desc: 'Liên hệ trực tiếp với gia sư bạn quan tâm, đặt thêm câu hỏi và thử buổi học trước khi cam kết.',
  },
]

const tutorSteps = [
  {
    step: 1,
    title: 'Tạo hồ sơ năng lực có cấu trúc',
    desc: 'Trình bày rõ môn dạy, nhóm người học phù hợp, kinh nghiệm và phương pháp giảng dạy trong một hồ sơ chuẩn hóa.',
  },
  {
    step: 2,
    title: 'Cung cấp lịch dạy và mức học phí',
    desc: 'Cập nhật khung giờ bạn có thể dạy và mức học phí dự kiến để người học dễ dàng đánh giá sự phù hợp.',
  },
  {
    step: 3,
    title: 'Nhận những nhu cầu học phù hợp',
    desc: 'Hệ thống sẽ đề xuất hồ sơ của bạn đến những người học có mục tiêu và điều kiện phù hợp với năng lực của bạn.',
  },
  {
    step: 4,
    title: 'Trao đổi trực tiếp với người học',
    desc: 'Kết nối với người học quan tâm, trả lời câu hỏi của họ và cùng nhau quyết định bước tiếp theo.',
  },
]

function StepCard({ step, title, desc }: { step: number; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className="w-9 h-9 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center">
          {step}
        </div>
        {step < 4 && <div className="w-0.5 h-full mt-2 bg-edge min-h-[2rem]" />}
      </div>
      <div className="pb-8">
        <h4 className="font-bold text-navy text-base mb-1.5">{title}</h4>
        <p className="text-slate text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<'learner' | 'tutor'>('learner')

  return (
    <section className="py-16 md:py-24 bg-section">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-navy mb-4">
            Cách hoạt động (dự kiến)
          </h2>
          <p className="text-slate text-base md:text-lg">
            Chọn vai trò của bạn để xem các bước kết nối phù hợp.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-edge rounded-2xl p-1.5 gap-1">
            <button
              onClick={() => setActiveTab('learner')}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'learner'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate hover:text-navy'
              }`}
            >
              Dành cho người học
            </button>
            <button
              onClick={() => setActiveTab('tutor')}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'tutor'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate hover:text-navy'
              }`}
            >
              Dành cho gia sư
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-surface rounded-2xl border border-edge p-6 md:p-8 shadow-sm">
          {(activeTab === 'learner' ? learnerSteps : tutorSteps).map((s) => (
            <StepCard key={s.step} {...s} />
          ))}
        </div>
      </div>
    </section>
  )
}
