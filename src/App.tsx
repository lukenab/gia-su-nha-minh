import { createContext, useContext, useState } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import ProblemSection from './components/ProblemSection'
import SolutionSection from './components/SolutionSection'
import HowItWorks from './components/HowItWorks'
import MatchingSection from './components/MatchingSection'
import TutorProfiles from './components/TutorProfiles'
import DualCTA from './components/DualCTA'
import FAQ from './components/FAQ'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'
import LearnerModal from './components/LearnerModal'
import TutorModal from './components/TutorModal'

interface FormContextType {
  openLearnerForm: (role?: string) => void
  openTutorForm: () => void
}

export const FormContext = createContext<FormContextType>({
  openLearnerForm: () => {},
  openTutorForm: () => {},
})

export function useFormContext() {
  return useContext(FormContext)
}

export default function App() {
  const [learnerOpen, setLearnerOpen] = useState(false)
  const [tutorOpen, setTutorOpen] = useState(false)
  const [learnerRole, setLearnerRole] = useState('')

  function openLearnerForm(role = '') {
    setLearnerRole(role)
    setLearnerOpen(true)
  }

  function openTutorForm() {
    setTutorOpen(true)
  }

  return (
    <FormContext.Provider value={{ openLearnerForm, openTutorForm }}>
      <div className="min-h-screen bg-page font-sans">
        <Nav />
        <main>
          <div id="hero"><Hero /></div>
          <div id="ve-du-an"><ProblemSection /></div>
          <SolutionSection />
          <div id="cach-hoat-dong"><HowItWorks /></div>
          <MatchingSection />
          <div id="danh-cho-gia-su"><TutorProfiles /></div>
          <DualCTA />
          <div id="cau-hoi-thuong-gap"><FAQ /></div>
          <FinalCTA />
        </main>
        <Footer />

        {learnerOpen && (
          <LearnerModal initialRole={learnerRole} onClose={() => setLearnerOpen(false)} />
        )}
        {tutorOpen && (
          <TutorModal onClose={() => setTutorOpen(false)} />
        )}

        {/* Mobile sticky bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-edge shadow-xl md:hidden z-40">
          <button
            onClick={() => openLearnerForm()}
            className="w-full bg-primary text-white font-bold py-3.5 rounded-xl text-base tracking-wide"
          >
            Đăng ký quan tâm
          </button>
        </div>
      </div>
    </FormContext.Provider>
  )
}
