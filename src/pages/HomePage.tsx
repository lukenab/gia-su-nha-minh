import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import DualCTA from '@/components/DualCTA'
import FAQ from '@/components/FAQ'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import MatchingSection from '@/components/MatchingSection'
import ProblemSection from '@/components/ProblemSection'
import SolutionSection from '@/components/SolutionSection'
import TutorProfiles from '@/components/TutorProfiles'
import { useFormContext } from '@/context/FormModalContext'
import { usePageMetadata } from '@/hooks/usePageMetadata'

const title = 'Gia Sư Nhà Mình | Tìm gia sư tiếng Anh phù hợp'
const description =
  'Dịch vụ kết nối sinh viên tại Cần Thơ với gia sư tiếng Anh theo mục tiêu, lịch học và ngân sách. Phản hồi trong 24 giờ.'

export default function HomePage() {
  const location = useLocation()
  const { openLearnerForm } = useFormContext()
  usePageMetadata(title, description)

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0 })
      return
    }

    window.requestAnimationFrame(() => {
      document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [location.hash])

  return (
    <>
      <div id="hero"><Hero /></div>
      <div id="ve-du-an"><ProblemSection /></div>
      <SolutionSection />
      <div id="cach-hoat-dong"><HowItWorks /></div>
      <MatchingSection />
      <div id="danh-cho-gia-su"><TutorProfiles /></div>
      <DualCTA />
      <div id="cau-hoi-thuong-gap"><FAQ /></div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-edge bg-white p-4 shadow-xl md:hidden">
        <button
          onClick={() => openLearnerForm()}
          className="w-full rounded-xl bg-primary py-3.5 text-base font-bold tracking-wide text-white transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Gửi yêu cầu tìm gia sư
        </button>
      </div>
    </>
  )
}
