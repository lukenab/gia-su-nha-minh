import { useEffect, useState } from 'react'

interface Props {
  initialRole?: string
  onClose: () => void
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-navy mb-1.5">
        {label}{required && <span className="text-orange ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full border border-edge rounded-xl px-4 py-3 text-navy text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors placeholder:text-slate/50'
const selectCls = `${inputCls} appearance-none bg-white`

export default function LearnerModal({ initialRole = '', onClose }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    name: '',
    role: initialRole,
    subject: '',
    goal: '',
    level: '',
    schedule: '',
    budget: '',
    format: '',
    area: '',
    contact: '',
    channel: '',
    consent: false,
  })

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  function set(key: string, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => { const n = { ...e }; delete n[key]; return n })
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Vui lòng nhập họ và tên'
    if (!form.role) e.role = 'Vui lòng chọn vai trò của bạn'
    if (!form.subject.trim()) e.subject = 'Vui lòng mô tả nội dung học'
    if (!form.goal.trim()) e.goal = 'Vui lòng mô tả mục tiêu học tập'
    if (!form.schedule.trim()) e.schedule = 'Vui lòng nhập khung thời gian'
    if (!form.budget) e.budget = 'Vui lòng chọn ngân sách'
    if (!form.format) e.format = 'Vui lòng chọn hình thức học'
    if (!form.contact.trim()) e.contact = 'Vui lòng nhập email hoặc số điện thoại'
    if (!form.consent) e.consent = 'Vui lòng đồng ý để tiếp tục'
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSubmitted(true)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-navy/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl shadow-xl overflow-hidden max-h-screen flex flex-col rounded-t-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-edge flex-shrink-0">
          <div>
            <h2 className="font-bold text-navy text-lg">Chia sẻ nhu cầu học tập</h2>
            <p className="text-xs text-slate mt-0.5">Thông tin dùng cho khảo sát — không mất phí</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-page flex items-center justify-center hover:bg-edge transition-colors"
            aria-label="Đóng"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="#64748B" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {submitted ? (
          /* Success state */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-teal-light flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" stroke="#0D9488" strokeWidth="2" />
                <path d="M9 16l5 5 9-9" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-bold text-navy text-xl mb-3">Cảm ơn bạn đã chia sẻ!</h3>
            <p className="text-slate text-sm leading-relaxed max-w-sm">
              Gia Sư Nhà Mình sẽ sử dụng thông tin này cho hoạt động khảo sát và sẽ liên hệ khi có chương trình thử nghiệm phù hợp.
            </p>
            <button
              onClick={onClose}
              className="mt-6 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors"
            >
              Đóng
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4" noValidate>
            <Field label="Họ và tên" required>
              <input
                type="text"
                className={`${inputCls} ${errors.name ? 'border-red-400' : ''}`}
                placeholder="Nguyễn Văn A"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </Field>

            <Field label="Bạn là" required>
              <select
                className={`${selectCls} ${errors.role ? 'border-red-400' : ''}`}
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
              >
                <option value="">-- Chọn vai trò --</option>
                <option>Sinh viên</option>
                <option>Học sinh</option>
                <option>Phụ huynh</option>
                <option>Khác</option>
              </select>
              {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
            </Field>

            <Field label="Bạn đang muốn học nội dung nào?" required>
              <input
                type="text"
                className={`${inputCls} ${errors.subject ? 'border-red-400' : ''}`}
                placeholder="VD: Tiếng Anh giao tiếp, Toán đại học..."
                value={form.subject}
                onChange={(e) => set('subject', e.target.value)}
              />
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
            </Field>

            <Field label="Mục tiêu học tập cụ thể" required>
              <textarea
                rows={3}
                className={`${inputCls} resize-none ${errors.goal ? 'border-red-400' : ''}`}
                placeholder="VD: Luyện nói tiếng Anh để phỏng vấn thực tập, cải thiện kỹ năng nghe..."
                value={form.goal}
                onChange={(e) => set('goal', e.target.value)}
              />
              {errors.goal && <p className="text-red-500 text-xs mt-1">{errors.goal}</p>}
            </Field>

            <Field label="Trình độ hiện tại">
              <input
                type="text"
                className={inputCls}
                placeholder="VD: Cơ bản, IELTS 5.0, đã học 2 năm... (không bắt buộc)"
                value={form.level}
                onChange={(e) => set('level', e.target.value)}
              />
            </Field>

            <Field label="Khung thời gian có thể học" required>
              <input
                type="text"
                className={`${inputCls} ${errors.schedule ? 'border-red-400' : ''}`}
                placeholder="VD: Tối thứ 3, thứ 5 từ 19:00-21:00"
                value={form.schedule}
                onChange={(e) => set('schedule', e.target.value)}
              />
              {errors.schedule && <p className="text-red-500 text-xs mt-1">{errors.schedule}</p>}
            </Field>

            <Field label="Ngân sách dự kiến mỗi buổi" required>
              <select
                className={`${selectCls} ${errors.budget ? 'border-red-400' : ''}`}
                value={form.budget}
                onChange={(e) => set('budget', e.target.value)}
              >
                <option value="">-- Chọn mức học phí --</option>
                <option>Dưới 100.000đ</option>
                <option>100.000 – 150.000đ</option>
                <option>150.000 – 200.000đ</option>
                <option>200.000 – 300.000đ</option>
                <option>Trên 300.000đ</option>
                <option>Chưa xác định</option>
              </select>
              {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget}</p>}
            </Field>

            <Field label="Hình thức mong muốn" required>
              <div className="flex gap-3">
                {['Online', 'Trực tiếp', 'Linh hoạt'].map((v) => (
                  <label key={v} className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value={v}
                      className="sr-only"
                      checked={form.format === v}
                      onChange={() => set('format', v)}
                    />
                    <div
                      className={`text-center py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
                        form.format === v
                          ? 'border-primary bg-primary-light text-primary'
                          : 'border-edge text-slate hover:border-primary/40'
                      }`}
                    >
                      {v}
                    </div>
                  </label>
                ))}
              </div>
              {errors.format && <p className="text-red-500 text-xs mt-1">{errors.format}</p>}
            </Field>

            <Field label="Khu vực">
              <input
                type="text"
                className={inputCls}
                placeholder="VD: Quận 1, TP.HCM (không bắt buộc)"
                value={form.area}
                onChange={(e) => set('area', e.target.value)}
              />
            </Field>

            <Field label="Email hoặc số điện thoại" required>
              <input
                type="text"
                className={`${inputCls} ${errors.contact ? 'border-red-400' : ''}`}
                placeholder="email@example.com hoặc 09xxxxxxxx"
                value={form.contact}
                onChange={(e) => set('contact', e.target.value)}
              />
              {errors.contact && <p className="text-red-500 text-xs mt-1">{errors.contact}</p>}
            </Field>

            <Field label="Kênh liên hệ ưu tiên">
              <div className="flex flex-wrap gap-2">
                {['Email', 'Điện thoại', 'Zalo', 'Messenger'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => set('channel', form.channel === v ? '' : v)}
                    className={`px-3.5 py-2 rounded-xl border text-sm font-medium transition-colors ${
                      form.channel === v
                        ? 'border-primary bg-primary-light text-primary'
                        : 'border-edge text-slate hover:border-primary/40'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </Field>

            {/* Consent */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 accent-primary flex-shrink-0"
                  checked={form.consent}
                  onChange={(e) => set('consent', e.target.checked)}
                />
                <span className="text-sm text-slate leading-relaxed">
                  Tôi đồng ý để Gia Sư Nhà Mình sử dụng thông tin này cho mục đích khảo sát và liên hệ khi chương trình thử nghiệm bắt đầu.
                  <span className="text-orange ml-1">*</span>
                </span>
              </label>
              {errors.consent && <p className="text-red-500 text-xs mt-1 ml-7">{errors.consent}</p>}
            </div>

            <div className="pt-2 pb-4">
              <button
                type="submit"
                className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary-dark transition-colors text-base"
              >
                Gửi nhu cầu
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
