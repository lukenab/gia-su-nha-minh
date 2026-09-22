import { useFormContext } from '@/context/FormModalContext'
import Icon from './Icon'

export default function DualCTA() {
  const { openLearnerForm, openTutorForm } = useFormContext()

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="grid overflow-hidden rounded-3xl border border-edge bg-white shadow-[0_20px_55px_rgba(30,41,59,0.14)] lg:grid-cols-[0.82fr_1.18fr]">
          <div className="flex flex-col justify-center bg-navy p-8 text-white md:p-10 lg:p-12">
            <p className="mb-4 text-xs font-semibold tracking-wide text-white/60">BẮT ĐẦU</p>
            <h2 className="mb-4 text-3xl font-bold tracking-[-0.02em] md:text-4xl">Bắt đầu với vai trò phù hợp</h2>
            <p className="max-w-md text-sm leading-relaxed text-white/70 md:text-base">
              Chọn nhu cầu của bạn để gửi đúng thông tin ngay từ bước đầu. Đội ngũ Gia Sư Nhà Mình sẽ tiếp nhận và hỗ trợ trong vòng 24 giờ.
            </p>
            <div className="mt-7 flex w-fit items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-xs font-semibold text-white/80">
              <Icon name="clock" className="h-4 w-4" />
              Phản hồi yêu cầu trong 24 giờ
            </div>
          </div>

          <div className="space-y-4 bg-page p-5 sm:p-6 md:p-8">
            <article className="rounded-2xl border border-edge bg-white p-6 text-navy shadow-[0_8px_24px_rgba(30,41,59,0.08)] md:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary"><Icon name="book" /></div>
                <div>
                  <h3 className="mb-2 text-xl font-bold text-navy">Bạn đang tìm gia sư?</h3>
                  <p className="text-sm leading-relaxed text-slate">Cho chúng tôi biết mục tiêu, lịch học và ngân sách để nhận hỗ trợ tìm người phù hợp.</p>
                </div>
              </div>
              <button onClick={() => openLearnerForm()} className="mt-6 w-full rounded-xl bg-primary py-3.5 font-bold text-white transition-colors hover:bg-primary-dark">Gửi yêu cầu tìm gia sư</button>
            </article>

            <article className="rounded-2xl border border-edge bg-white p-6 text-navy shadow-[0_8px_24px_rgba(30,41,59,0.08)] md:p-7">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-teal-light text-teal"><Icon name="profile" /></div>
                <div>
                  <h3 className="mb-2 text-xl font-bold">Bạn muốn trở thành gia sư?</h3>
                  <p className="text-sm leading-relaxed text-slate">Gửi hồ sơ năng lực để tiếp cận những nhu cầu học phù hợp với chuyên môn và lịch của bạn.</p>
                </div>
              </div>
              <button onClick={openTutorForm} className="mt-6 w-full rounded-xl bg-teal py-3.5 font-bold text-white transition-colors hover:bg-[#0B7F75]">Đăng ký làm gia sư</button>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
