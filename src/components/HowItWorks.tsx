import { useState } from 'react'
import Icon, { type IconName } from './Icon'

interface Step {
  icon: IconName
  title: string
  description: string
}

const learnerSteps: Step[] = [
  {
    icon: 'clipboard',
    title: 'Gửi yêu cầu học tập',
    description: 'Cho chúng tôi biết mục tiêu, trình độ hiện tại, lịch học, ngân sách và hình thức bạn mong muốn.',
  },
  {
    icon: 'search',
    title: 'Nhận phản hồi trong 24 giờ',
    description: 'Đội ngũ đối chiếu yêu cầu với các hồ sơ gia sư tiếng Anh phù hợp và liên hệ lại với bạn.',
  },
  {
    icon: 'message',
    title: 'Trao đổi và lựa chọn',
    description: 'Xem thông tin, trao đổi trực tiếp với gia sư và tự quyết định trước khi bắt đầu buổi học.',
  },
]

const tutorSteps: Step[] = [
  {
    icon: 'profile',
    title: 'Gửi hồ sơ năng lực',
    description: 'Cung cấp chuyên môn, chứng chỉ, kinh nghiệm, phương pháp, lịch dạy và mức học phí mong muốn.',
  },
  {
    icon: 'shield',
    title: 'Xác minh thông tin',
    description: 'Đội ngũ kiểm tra danh tính, chứng chỉ và kinh nghiệm trước khi đưa hồ sơ vào nguồn kết nối.',
  },
  {
    icon: 'message',
    title: 'Nhận nhu cầu phù hợp',
    description: 'Chúng tôi liên hệ khi có người học phù hợp để hai bên trao đổi và thống nhất việc học.',
  },
]

function StepGrid({ steps }: { steps: Step[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {steps.map((step, index) => (
        <article
          key={step.title}
          className="relative rounded-2xl border border-edge bg-white p-6 shadow-[0_10px_30px_rgba(30,41,59,0.08)]"
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
              <Icon name={step.icon} />
            </div>
            <span className="text-sm font-bold text-slate/40">0{index + 1}</span>
          </div>
          <h3 className="mb-2 font-bold text-navy">{step.title}</h3>
          <p className="text-sm leading-relaxed text-slate">{step.description}</p>
        </article>
      ))}
    </div>
  )
}

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<'learner' | 'tutor'>('learner')
  const steps = activeTab === 'learner' ? learnerSteps : tutorSteps

  return (
    <section className="border-b border-edge bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-9 text-center">
          <p className="mb-3 text-sm font-semibold text-primary">QUY TRÌNH KẾT NỐI</p>
          <h2 className="mb-4 text-3xl font-bold tracking-[-0.02em] text-navy md:text-4xl">Đơn giản, rõ ràng và có người hỗ trợ</h2>
          <p className="text-base text-slate md:text-lg">Chọn vai trò để xem các bước phù hợp với bạn.</p>
        </div>

        <div className="mb-9 flex justify-center">
          <div className="inline-flex gap-1 rounded-xl bg-section p-1" role="tablist" aria-label="Quy trình theo vai trò">
            <button
              id="learner-tab"
              role="tab"
              aria-selected={activeTab === 'learner'}
              aria-controls="how-it-works-panel"
              onClick={() => setActiveTab('learner')}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${activeTab === 'learner' ? 'bg-white text-primary shadow-sm' : 'text-slate hover:text-navy'}`}
            >
              Dành cho người học
            </button>
            <button
              id="tutor-tab"
              role="tab"
              aria-selected={activeTab === 'tutor'}
              aria-controls="how-it-works-panel"
              onClick={() => setActiveTab('tutor')}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${activeTab === 'tutor' ? 'bg-white text-primary shadow-sm' : 'text-slate hover:text-navy'}`}
            >
              Dành cho gia sư
            </button>
          </div>
        </div>

        <div id="how-it-works-panel" role="tabpanel" aria-labelledby={activeTab === 'learner' ? 'learner-tab' : 'tutor-tab'}>
          <StepGrid steps={steps} />
        </div>
      </div>
    </section>
  )
}
