import { useFormContext } from '@/context/FormModalContext'

export default function FinalCTA() {
  const { openLearnerForm, openTutorForm } = useFormContext()

  return (
    <section className="py-16 md:py-24 bg-primary">
      <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-5 leading-tight">
          Cùng chúng tôi xây dựng một cách tìm gia sư phù hợp hơn
        </h2>
        <p className="text-white/80 text-base md:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          Chia sẻ nhu cầu của bạn để Gia Sư Nhà Mình hiểu điều gì thực sự quan trọng đối với người học và gia sư.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => openLearnerForm()}
            className="bg-white text-primary font-bold px-8 py-4 rounded-xl hover:bg-primary-light transition-colors text-base"
          >
            Tôi muốn tìm gia sư
          </button>
          <button
            onClick={openTutorForm}
            className="border-2 border-white/60 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 transition-colors text-base"
          >
            Tôi muốn trở thành gia sư
          </button>
        </div>
      </div>
    </section>
  )
}
