import { useFormContext } from '@/context/FormModalContext'
import Icon from './Icon'

export default function DualCTA() {
  const { openLearnerForm, openTutorForm } = useFormContext()

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="overflow-hidden rounded-3xl bg-primary p-6 shadow-xl shadow-primary/15 md:p-10">
          <div className="mb-8 text-center text-white">
            <h2 className="mb-3 text-3xl font-bold tracking-[-0.02em] md:text-4xl">Bắt đầu với vai trò phù hợp</h2>
            <p className="mx-auto max-w-2xl text-base text-white/75">Gửi thông tin để đội ngũ Gia Sư Nhà Mình có thể hỗ trợ bạn trong vòng 24 giờ.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl bg-white p-6 md:p-7">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary"><Icon name="book" /></div>
              <h3 className="mb-2 text-xl font-bold text-navy">Bạn đang tìm gia sư?</h3>
              <p className="mb-6 text-sm leading-relaxed text-slate">Cho chúng tôi biết mục tiêu, lịch học và ngân sách để nhận hỗ trợ tìm người phù hợp.</p>
              <button onClick={() => openLearnerForm()} className="w-full rounded-xl bg-primary py-3.5 font-bold text-white transition-colors hover:bg-primary-dark">Gửi yêu cầu tìm gia sư</button>
            </article>

            <article className="rounded-2xl bg-navy p-6 text-white md:p-7">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white"><Icon name="profile" /></div>
              <h3 className="mb-2 text-xl font-bold">Bạn muốn trở thành gia sư?</h3>
              <p className="mb-6 text-sm leading-relaxed text-white/65">Gửi hồ sơ năng lực để tiếp cận những nhu cầu học phù hợp với chuyên môn và lịch của bạn.</p>
              <button onClick={openTutorForm} className="w-full rounded-xl bg-white py-3.5 font-bold text-navy transition-colors hover:bg-primary-light">Đăng ký làm gia sư</button>
            </article>
          </div>
        </div>
      </div>
    </section>
  )
}
