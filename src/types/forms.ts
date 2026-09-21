export type ContactChannel = '' | 'Email' | 'Điện thoại' | 'Zalo' | 'Messenger'

export interface LearnerFormData {
  name: string
  role: string
  subject: string
  goal: string
  level: string
  schedule: string
  budget: string
  format: string
  area: string
  contact: string
  channel: ContactChannel
  consent: boolean
}

export interface TutorFormData {
  name: string
  subjects: string
  learnerGroup: string
  experience: string
  method: string
  schedule: string
  fee: string
  format: string
  area: string
  contact: string
  channel: ContactChannel
  consent: boolean
}

export type SurveyFormKind = 'learner' | 'tutor'
export type SurveyFormData = LearnerFormData | TutorFormData
