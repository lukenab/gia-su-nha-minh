import { useFormContext } from '@/context/FormModalContext'
import Icon from './Icon'

export default function DualCTA() {
  const { openLearnerForm, openTutorForm } = useFormContext()

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-semibold text-primary">BẮT ĐẦU</p>
          <h2 className="mb-4 text-3xl font-bold tracking-[-0.02em] text-navy md:text-4xl">Bắt đầu với vai trò phù hợp</h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate md:text-lg">
            Chọn nhu cầu của bạn để gửi đúng thông tin ngay từ bước đầu.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-edge bg-white px-6 shadow-[0_16px_44px_rgba(30,41,59,0.1)] md:px-8">
          <article className="flex flex-col gap-5 py-7 md:flex-row md:items-center md:gap-6">
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary"><Icon name="book" /></div>
              <div>
                <h3 className="mb-2 text-xl font-bold text-navy">Tôi cần tìm gia sư</h3>
                <p className="text-sm leading-relaxed text-slate">Cho chúng tôi biết mục tiêu học tập, lịch học và ngân sách của bạn.</p>
              </div>
            </div>
            <button onClick={() => openLearnerForm()} className="w-full rounded-xl bg-primary px-6 py-3.5 font-bold text-white transition-colors hover:bg-primary-dark md:w-auto md:min-w-56">Gửi yêu cầu →</button>
          </article>

          <article className="flex flex-col gap-5 border-t border-edge py-7 md:flex-row md:items-center md:gap-6">
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-teal-light text-teal"><Icon name="profile" /></div>
              <div>
                <h3 className="mb-2 text-xl font-bold text-navy">Tôi muốn làm gia sư</h3>
                <p className="text-sm leading-relaxed text-slate">Cung cấp chuyên môn, kinh nghiệm và lịch dạy để nhận nhu cầu phù hợp.</p>
              </div>
            </div>
            <button onClick={openTutorForm} className="w-full rounded-xl bg-teal px-6 py-3.5 font-bold text-white transition-colors hover:bg-[#0B7F75] md:w-auto md:min-w-56">Đăng ký hồ sơ →</button>
          </article>
        </div>
      </div>
    </section>
  )
}
