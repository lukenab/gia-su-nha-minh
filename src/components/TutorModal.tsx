import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { submitGoogleForm } from '@/api/googleForms'
import { useAccessibleModal } from '@/hooks/useAccessibleModal'
import type { TutorFormData } from '@/types/forms'

interface Props { onClose: () => void }
interface FieldProps { id: string; label: string; required?: boolean; error?: string; children: ReactNode }

function Field({ id, label, required, error, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-navy">
        {label}{required && <span className="ml-1 text-orange" aria-hidden="true">*</span>}
      </label>
      {children}
      {error && <p id={`${id}-error`} className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

const inputCls = 'w-full rounded-xl border border-edge px-4 py-3 text-sm text-navy transition-colors placeholder:text-slate/50 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/40'
const selectCls = `${inputCls} appearance-none bg-white`

export default function TutorModal({ onClose }: Props) {
  const dialogRef = useAccessibleModal(onClose)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState<TutorFormData>({
    name: '', subjects: '', learnerGroup: '', experience: '', method: '', schedule: '', fee: '',
    format: '', area: '', contact: '', channel: '', consent: false,
  })

  function set<K extends keyof TutorFormData>(key: K, value: TutorFormData[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => { const next = { ...current }; delete next[key]; return next })
    setSubmitError('')
  }

  function validate() {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = 'Vui lòng nhập họ và tên'
    if (!form.subjects.trim()) next.subjects = 'Vui lòng nhập nội dung tiếng Anh có thể dạy'
    if (!form.learnerGroup.trim()) next.learnerGroup = 'Vui lòng mô tả nhóm sinh viên phù hợp'
    if (!form.experience.trim()) next.experience = 'Vui lòng mô tả kinh nghiệm giảng dạy'
    if (!form.schedule.trim()) next.schedule = 'Vui lòng nhập khung thời gian có thể dạy'
    if (!form.fee) next.fee = 'Vui lòng chọn mức học phí dự kiến'
    if (!form.format) next.format = 'Vui lòng chọn hình thức dạy'
    if (!form.contact.trim()) next.contact = 'Vui lòng nhập email hoặc số điện thoại'
    if (!form.consent) next.consent = 'Vui lòng đồng ý để tiếp tục'
    return next
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }

    setSubmitting(true)
    try {
      await submitGoogleForm('tutor', form)
      setSubmitted(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Không thể gửi biểu mẫu lúc này. Vui lòng thử lại sau.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="tutor-dialog-title" aria-describedby="tutor-dialog-description" tabIndex={-1} className="flex max-h-screen w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:max-w-lg sm:rounded-2xl">
        <div className="flex flex-shrink-0 items-center justify-between border-b border-edge p-5">
          <div>
            <h2 id="tutor-dialog-title" className="text-lg font-bold text-navy">Đăng ký quan tâm dành cho gia sư</h2>
            <p id="tutor-dialog-description" className="mt-0.5 text-xs text-slate">Khảo sát gia sư tiếng Anh tại Cần Thơ — không mất phí</p>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-page transition-colors hover:bg-edge focus-visible:outline-2 focus-visible:outline-teal" aria-label="Đóng biểu mẫu">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 1l12 12M13 1L1 13" stroke="#64748B" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center" aria-live="polite">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-light" aria-hidden="true"><svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" stroke="#0D9488" strokeWidth="2" /><path d="M9 16l5 5 9-9" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
            <h3 className="mb-3 text-xl font-bold text-navy">Cảm ơn bạn đã chia sẻ!</h3>
            <p className="max-w-sm text-sm leading-relaxed text-slate">Thông tin đã được ghi nhận cho hoạt động khảo sát. Nhóm sẽ liên hệ khi có chương trình thử nghiệm phù hợp.</p>
            <button onClick={onClose} className="mt-6 rounded-xl bg-teal px-6 py-3 font-semibold text-white transition-opacity hover:opacity-90">Đóng</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto p-5" noValidate>
            {submitError && <div role="alert" className="rounded-xl border border-orange/30 bg-orange-light p-3 text-sm text-navy">{submitError}</div>}

            <Field id="tutor-name" label="Họ và tên" required error={errors.name}>
              <input id="tutor-name" autoComplete="name" className={`${inputCls} ${errors.name ? 'border-red-500' : ''}`} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'tutor-name-error' : undefined} placeholder="Nguyễn Văn A" value={form.name} onChange={(event) => set('name', event.target.value)} />
            </Field>
            <Field id="tutor-subjects" label="Nội dung tiếng Anh có thể giảng dạy" required error={errors.subjects}>
              <input id="tutor-subjects" className={`${inputCls} ${errors.subjects ? 'border-red-500' : ''}`} aria-invalid={Boolean(errors.subjects)} aria-describedby={errors.subjects ? 'tutor-subjects-error' : undefined} placeholder="VD: Giao tiếp, IELTS, tiếng Anh phỏng vấn" value={form.subjects} onChange={(event) => set('subjects', event.target.value)} />
            </Field>
            <Field id="tutor-group" label="Nhóm sinh viên phù hợp" required error={errors.learnerGroup}>
              <input id="tutor-group" className={`${inputCls} ${errors.learnerGroup ? 'border-red-500' : ''}`} aria-invalid={Boolean(errors.learnerGroup)} aria-describedby={errors.learnerGroup ? 'tutor-group-error' : undefined} placeholder="VD: Sinh viên mất gốc, sinh viên chuẩn bị thực tập" value={form.learnerGroup} onChange={(event) => set('learnerGroup', event.target.value)} />
            </Field>
            <Field id="tutor-experience" label="Kinh nghiệm giảng dạy" required error={errors.experience}>
              <textarea id="tutor-experience" rows={3} className={`${inputCls} resize-none ${errors.experience ? 'border-red-500' : ''}`} aria-invalid={Boolean(errors.experience)} aria-describedby={errors.experience ? 'tutor-experience-error' : undefined} placeholder="VD: Hai năm dạy tiếng Anh giao tiếp cho sinh viên" value={form.experience} onChange={(event) => set('experience', event.target.value)} />
            </Field>
            <Field id="tutor-method" label="Phương pháp hoặc thế mạnh giảng dạy">
              <textarea id="tutor-method" rows={2} className={`${inputCls} resize-none`} placeholder="VD: Thực hành hội thoại, phản hồi chi tiết" value={form.method} onChange={(event) => set('method', event.target.value)} />
            </Field>
            <Field id="tutor-schedule" label="Khung thời gian có thể dạy" required error={errors.schedule}>
              <input id="tutor-schedule" className={`${inputCls} ${errors.schedule ? 'border-red-500' : ''}`} aria-invalid={Boolean(errors.schedule)} aria-describedby={errors.schedule ? 'tutor-schedule-error' : undefined} placeholder="VD: Tối thứ 2, 4, 6 từ 19:00–21:00" value={form.schedule} onChange={(event) => set('schedule', event.target.value)} />
            </Field>
            <Field id="tutor-fee" label="Mức học phí dự kiến" required error={errors.fee}>
              <select id="tutor-fee" className={`${selectCls} ${errors.fee ? 'border-red-500' : ''}`} value={form.fee} aria-invalid={Boolean(errors.fee)} aria-describedby={errors.fee ? 'tutor-fee-error' : undefined} onChange={(event) => set('fee', event.target.value)}>
                <option value="">-- Chọn mức học phí --</option><option>Dưới 100.000đ/buổi</option><option>100.000 – 150.000đ/buổi</option><option>150.000 – 200.000đ/buổi</option><option>200.000 – 300.000đ/buổi</option><option>Trên 300.000đ/buổi</option><option>Thỏa thuận</option>
              </select>
            </Field>

            <fieldset>
              <legend className="mb-1.5 text-sm font-semibold text-navy">Hình thức dạy <span className="text-orange" aria-hidden="true">*</span></legend>
              <div className="flex gap-3">
                {['Online', 'Trực tiếp', 'Cả hai'].map((value) => (
                  <label key={value} className="flex-1 cursor-pointer">
                    <input type="radio" name="tutor-format" value={value} className="peer sr-only" checked={form.format === value} onChange={() => set('format', value)} />
                    <span className="block rounded-xl border-2 border-edge py-2.5 text-center text-sm font-medium text-slate transition-colors hover:border-teal/40 peer-checked:border-teal peer-checked:bg-teal-light peer-checked:text-teal peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal">{value}</span>
                  </label>
                ))}
              </div>
              {errors.format && <p className="mt-1 text-xs text-red-600">{errors.format}</p>}
            </fieldset>

            <Field id="tutor-area" label="Khu vực tại Cần Thơ">
              <input id="tutor-area" className={inputCls} placeholder="VD: Ninh Kiều, Bình Thủy (không bắt buộc)" value={form.area} onChange={(event) => set('area', event.target.value)} />
            </Field>
            <Field id="tutor-contact" label="Email hoặc số điện thoại" required error={errors.contact}>
              <input id="tutor-contact" autoComplete="email" className={`${inputCls} ${errors.contact ? 'border-red-500' : ''}`} aria-invalid={Boolean(errors.contact)} aria-describedby={errors.contact ? 'tutor-contact-error' : undefined} placeholder="email@example.com hoặc 09xxxxxxxx" value={form.contact} onChange={(event) => set('contact', event.target.value)} />
            </Field>

            <fieldset>
              <legend className="mb-1.5 text-sm font-semibold text-navy">Kênh liên hệ ưu tiên</legend>
              <div className="flex flex-wrap gap-2">
                {(['Email', 'Điện thoại', 'Zalo', 'Messenger'] as const).map((value) => (
                  <button key={value} type="button" aria-pressed={form.channel === value} onClick={() => set('channel', form.channel === value ? '' : value)} className={`rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors ${form.channel === value ? 'border-teal bg-teal-light text-teal' : 'border-edge text-slate hover:border-teal/40'}`}>{value}</button>
                ))}
              </div>
            </fieldset>

            <div>
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" className="mt-1 h-4 w-4 flex-shrink-0 accent-teal" checked={form.consent} aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? 'tutor-consent-error' : undefined} onChange={(event) => set('consent', event.target.checked)} />
                <span className="text-sm leading-relaxed text-slate">Tôi đồng ý để Gia Sư Nhà Mình sử dụng thông tin cho mục đích khảo sát và liên hệ về chương trình thử nghiệm, theo <Link to="/privacy" onClick={onClose} className="font-medium text-primary underline">Chính sách bảo mật</Link>.<span className="ml-1 text-orange" aria-hidden="true">*</span></span>
              </label>
              {errors.consent && <p id="tutor-consent-error" className="ml-7 mt-1 text-xs text-red-600">{errors.consent}</p>}
            </div>

            <div className="pb-4 pt-2"><button type="submit" disabled={submitting} className="w-full rounded-xl bg-teal py-4 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-60">{submitting ? 'Đang gửi…' : 'Gửi thông tin'}</button></div>
          </form>
        )}
      </div>
    </div>
  )
}
