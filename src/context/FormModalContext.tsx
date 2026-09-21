import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import LearnerModal from '@/components/LearnerModal'
import TutorModal from '@/components/TutorModal'

interface FormContextType {
  openLearnerForm: (role?: string) => void
  openTutorForm: () => void
}

const FormModalContext = createContext<FormContextType | null>(null)

export function useFormContext() {
  const value = useContext(FormModalContext)
  if (!value) throw new Error('useFormContext must be used inside FormModalProvider')
  return value
}

export function FormModalProvider({ children }: { children: ReactNode }) {
  const [learnerRole, setLearnerRole] = useState<string | null>(null)
  const [tutorOpen, setTutorOpen] = useState(false)

  const value = useMemo(
    () => ({
      openLearnerForm: (role = 'Sinh viên') => setLearnerRole(role),
      openTutorForm: () => setTutorOpen(true),
    }),
    [],
  )

  return (
    <FormModalContext.Provider value={value}>
      {children}
      {learnerRole !== null && (
        <LearnerModal initialRole={learnerRole} onClose={() => setLearnerRole(null)} />
      )}
      {tutorOpen && <TutorModal onClose={() => setTutorOpen(false)} />}
    </FormModalContext.Provider>
  )
}
