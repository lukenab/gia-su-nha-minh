import type { SurveyFormData, SurveyFormKind } from '@/types/forms'

interface GoogleFormConfig {
  action: string
  entries: Record<string, string>
}

const requiredFields: Record<SurveyFormKind, string[]> = {
  learner: ['name', 'role', 'subject', 'goal', 'level', 'schedule', 'budget', 'format', 'area', 'contact', 'channel', 'consent'],
  tutor: ['name', 'subjects', 'learnerGroup', 'experience', 'method', 'schedule', 'fee', 'format', 'area', 'contact', 'channel', 'consent'],
}

export class FormConfigurationError extends Error {
  constructor() {
    super('Biểu mẫu tạm thời chưa sẵn sàng. Bạn có thể gửi yêu cầu trực tiếp qua Facebook.')
    this.name = 'FormConfigurationError'
  }
}

function parseEntries(raw: string | undefined) {
  if (!raw) return {}

  try {
    const value = JSON.parse(raw) as unknown
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

    return Object.fromEntries(
      Object.entries(value).filter(
        ([, entry]) => typeof entry === 'string' && /^entry\.\d+$/.test(entry),
      ),
    ) as Record<string, string>
  } catch {
    return {}
  }
}

function getConfig(kind: SurveyFormKind): GoogleFormConfig {
  const isLearner = kind === 'learner'
  return {
    action: isLearner
      ? import.meta.env.VITE_GOOGLE_FORM_LEARNER_ACTION || ''
      : import.meta.env.VITE_GOOGLE_FORM_TUTOR_ACTION || '',
    entries: parseEntries(
      isLearner
        ? import.meta.env.VITE_GOOGLE_FORM_LEARNER_ENTRIES
        : import.meta.env.VITE_GOOGLE_FORM_TUTOR_ENTRIES,
    ),
  }
}

export function isGoogleFormConfigured(kind: SurveyFormKind) {
  const { action, entries } = getConfig(kind)
  return (
    /^https:\/\/docs\.google\.com\/forms\/.+\/formResponse$/.test(action) &&
    requiredFields[kind].every((field) => entries[field])
  )
}

export async function submitGoogleForm(kind: SurveyFormKind, data: SurveyFormData) {
  const config = getConfig(kind)
  if (!isGoogleFormConfigured(kind)) throw new FormConfigurationError()

  const body = new URLSearchParams()
  Object.entries(data).forEach(([field, value]) => {
    const entry = config.entries[field]
    if (entry) body.set(entry, typeof value === 'boolean' ? (value ? 'Có' : 'Không') : value)
  })

  if (body.size === 0) throw new FormConfigurationError()

  await fetch(config.action, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
}
