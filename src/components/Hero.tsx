import { useFormContext } from '@/context/FormModalContext'
import Icon from './Icon'

const processSteps = [
  {
    title: 'Gửi mục tiêu và lịch học',
    description: 'Cho chúng tôi biết nội dung cần học, thời gian và hình thức phù hợp với bạn.',
  },
  {
    title: 'Đối chiếu hồ sơ gia sư',
    description: 'Đội ngũ xem xét chuyên môn, lịch dạy và mức độ phù hợp với yêu cầu.',
  },
  {
    title: 'Nhận thông tin để trao đổi',
    description: 'Bạn xem hồ sơ, trao đổi trực tiếp và tự quyết định trước khi bắt đầu học.',
  },
]

function MatchingOverview() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0">
      <div className="absolute -inset-8 -z-10 rounded-full bg-primary/10 blur-3xl" />
      <div className="rounded-3xl border border-primary/15 bg-white p-6 shadow-[0_24px_70px_rgba(30,41,59,0.12)] sm:p-7">
        <div className="mb-7">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-semibold text-primary">QUY TRÌNH HỖ TRỢ</p>
            <div className="flex flex-shrink-0 items-center gap-2 text-xs font-semibold text-teal">
              <Icon name="clock" className="h-4 w-4" />
              Trong 24 giờ
            </div>
          </div>
          <h2 className="mt-2 text-lg font-bold tracking-[-0.02em] text-navy sm:text-xl">Từ nhu cầu đến kết nối phù hợp</h2>
        </div>

        <ol>
          {processSteps.map((step, index) => (
            <li key={step.title} className="relative grid min-h-24 grid-cols-[2.75rem_1fr] gap-4 last:min-h-0">
              {index < processSteps.length - 1 && (
                <span className="absolute bottom-2 left-[1.34375rem] top-11 w-px bg-edge" aria-hidden="true" />
              )}
              <span className={`relative z-10 grid h-11 w-11 place-items-center rounded-full text-xs font-bold ${index === processSteps.length - 1 ? 'bg-teal-light text-teal' : 'bg-primary-light text-primary'}`}>
                0{index + 1}
              </span>
              <div className="pb-6 pt-1 last:pb-0">
                <h3 className="mb-1.5 text-sm font-bold text-navy">{step.title}</h3>
                <p className="text-xs leading-relaxed text-slate">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-7 flex flex-col gap-2 border-t border-edge pt-5 text-xs text-slate sm:flex-row sm:items-center sm:justify-between">
          <span>Không mất phí khi gửi yêu cầu</span>
          <strong className="font-semibold text-navy">Online hoặc trực tiếp tại Cần Thơ</strong>
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  const { openLearnerForm, openTutorForm } = useFormContext()

  return (
    <section className="relative overflow-hidden border-b border-edge bg-page pb-16 pt-28 md:pb-24 md:pt-36">
      <div className="absolute left-0 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white px-3.5 py-2 text-xs font-semibold text-primary shadow-sm">
              <Icon name="location" className="h-4 w-4" />
              Gia sư tiếng Anh cho sinh viên tại Cần Thơ
            </div>

            <h1 className="mb-6 text-4xl font-extrabold leading-[1.15] tracking-[-0.03em] text-navy md:text-5xl lg:text-[3.4rem]">
              Tìm gia sư phù hợp với{' '}
              <span className="text-primary">mục tiêu học tập</span> của bạn
            </h1>

            <p className="mb-8 max-w-xl text-base leading-relaxed text-slate md:text-lg">
              Gửi mục tiêu, lịch học và ngân sách của bạn. Đội ngũ Gia Sư Nhà Mình sẽ đối chiếu với hồ sơ gia sư tiếng Anh phù hợp và phản hồi trong vòng 24 giờ.
            </p>

            <div className="mb-7 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => openLearnerForm()}
                className="rounded-xl bg-primary px-7 py-4 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Gửi yêu cầu tìm gia sư
              </button>
              <button
                onClick={openTutorForm}
                className="rounded-xl border border-edge bg-white px-7 py-4 text-base font-bold text-navy transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Đăng ký làm gia sư
              </button>
            </div>

            <div className="grid gap-2 text-xs text-slate sm:grid-cols-3">
              {['Phản hồi trong 24 giờ', 'Gửi yêu cầu miễn phí', 'Hỗ trợ online và trực tiếp'].map((item) => (
                <span key={item} className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-light text-teal">
                    <Icon name="check" className="h-3.5 w-3.5" />
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <MatchingOverview />
          </div>
        </div>
      </div>
    </section>
  )
}
