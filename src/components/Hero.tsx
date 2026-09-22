import { useFormContext } from '@/context/FormModalContext'
import Icon from './Icon'

const requestDetails = [
  { icon: 'target' as const, label: 'Mục tiêu', value: 'Tiếng Anh cho phỏng vấn thực tập' },
  { icon: 'calendar' as const, label: 'Thời gian', value: 'Tối thứ Ba và thứ Năm' },
  { icon: 'laptop' as const, label: 'Hình thức', value: 'Online hoặc trực tiếp tại Cần Thơ' },
]

const verificationItems = [
  { icon: 'identity' as const, label: 'Danh tính' },
  { icon: 'certificate' as const, label: 'Chứng chỉ' },
  { icon: 'experience' as const, label: 'Kinh nghiệm' },
]

function MatchingOverview() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0">
      <div className="absolute -inset-8 -z-10 rounded-full bg-primary/10 blur-3xl" />
      <div className="overflow-hidden rounded-3xl border border-primary/15 bg-white shadow-[0_24px_70px_rgba(30,41,59,0.12)]">
        <div className="flex items-center justify-between border-b border-edge px-5 py-4">
          <div>
            <p className="text-xs font-semibold text-primary">YÊU CẦU TÌM GIA SƯ</p>
            <p className="mt-1 text-sm font-semibold text-navy">Tiếng Anh dành cho sinh viên</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-teal-light px-3 py-1.5 text-xs font-semibold text-teal">
            <Icon name="clock" className="h-4 w-4" />
            Phản hồi trong 24h
          </div>
        </div>

        <div className="space-y-4 p-5">
          {requestDetails.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                <Icon name={item.icon} />
              </div>
              <div>
                <p className="text-xs text-slate">{item.label}</p>
                <p className="mt-0.5 text-sm font-semibold text-navy">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-5 border-t border-edge" />

        <div className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-white">
              <Icon name="search" />
            </div>
            <div>
              <p className="text-xs text-slate">Đội ngũ Gia Sư Nhà Mình</p>
              <p className="text-sm font-semibold text-navy">Đối chiếu nhu cầu với hồ sơ phù hợp</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {verificationItems.map((item) => (
              <div key={item.label} className="rounded-xl border border-edge bg-page px-2 py-3 text-center">
                <Icon name={item.icon} className="mx-auto mb-1.5 h-4 w-4 text-teal" />
                <p className="text-[11px] font-semibold text-navy">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Hero() {
  const { openLearnerForm, openTutorForm } = useFormContext()

  return (
    <section className="relative overflow-hidden bg-page pb-16 pt-28 md:pb-24 md:pt-36">
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

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate">
              {['Phản hồi trong 24 giờ', 'Chưa thu phí kết nối', 'Online hoặc trực tiếp'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
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
