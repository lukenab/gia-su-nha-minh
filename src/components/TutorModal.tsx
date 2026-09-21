import { useEffect, useState } from 'react'

interface Props {
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

export default function TutorModal({ onClose }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    name: '',
    subjects: '',
    learnerGroup: '',
    experience: '',
    method: '',
    schedule: '',
    fee: '',
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
    if (!form.subjects.trim()) e.subjects = 'Vui lòng nhập môn hoặc kỹ năng có thể dạy'
    if (!form.learnerGroup.trim()) e.learnerGroup = 'Vui lòng mô tả nhóm người học phù hợp'
    if (!form.experience.trim()) e.experience = 'Vui lòng mô tả kinh nghiệm giảng dạy'
    if (!form.schedule.trim()) e.schedule = 'Vui lòng nhập khung thời gian có thể dạy'
    if (!form.fee) e.fee = 'Vui lòng chọn mức học phí dự kiến'
    if (!form.format) e.format = 'Vui lòng chọn hình thức dạy'
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
            <h2 className="font-bold text-navy text-lg">Đăng ký quan tâm dành cho gia sư</h2>
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
              className="mt-6 bg-teal text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              Đóng
            </button>
          </div>
        ) : (
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

            <Field label="Môn hoặc kỹ năng có thể giảng dạy" required>
              <input
                type="text"
                className={`${inputCls} ${errors.subjects ? 'border-red-400' : ''}`}
                placeholder="VD: Tiếng Anh giao tiếp, Toán, Lập trình Python..."
                value={form.subjects}
                onChange={(e) => set('subjects', e.target.value)}
              />
              {errors.subjects && <p className="text-red-500 text-xs mt-1">{errors.subjects}</p>}
            </Field>

            <Field label="Nhóm người học phù hợp" required>
              <input
                type="text"
                className={`${inputCls} ${errors.learnerGroup ? 'border-red-400' : ''}`}
                placeholder="VD: Sinh viên đại học, học sinh THPT, người đi làm..."
                value={form.learnerGroup}
                onChange={(e) => set('learnerGroup', e.target.value)}
              />
              {errors.learnerGroup && <p className="text-red-500 text-xs mt-1">{errors.learnerGroup}</p>}
            </Field>

            <Field label="Kinh nghiệm giảng dạy" required>
              <textarea
                rows={3}
                className={`${inputCls} resize-none ${errors.experience ? 'border-red-400' : ''}`}
                placeholder="VD: 2 năm dạy kèm tiếng Anh cho sinh viên, kinh nghiệm gia sư online..."
                value={form.experience}
                onChange={(e) => set('experience', e.target.value)}
              />
              {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
            </Field>

            <Field label="Phương pháp hoặc thế mạnh giảng dạy">
              <textarea
                rows={2}
                className={`${inputCls} resize-none`}
                placeholder="VD: Tập trung thực hành, giải thích bằng ví dụ thực tế, kiên nhẫn với người mới bắt đầu..."
                value={form.method}
                onChange={(e) => set('method', e.target.value)}
              />
            </Field>

            <Field label="Khung thời gian có thể dạy" required>
              <input
                type="text"
                className={`${inputCls} ${errors.schedule ? 'border-red-400' : ''}`}
                placeholder="VD: Tối thứ 2, 4, 6 từ 19:00-21:00"
                value={form.schedule}
                onChange={(e) => set('schedule', e.target.value)}
              />
              {errors.schedule && <p className="text-red-500 text-xs mt-1">{errors.schedule}</p>}
            </Field>

            <Field label="Mức học phí dự kiến" required>
              <select
                className={`${selectCls} ${errors.fee ? 'border-red-400' : ''}`}
                value={form.fee}
                onChange={(e) => set('fee', e.target.value)}
              >
                <option value="">-- Chọn mức học phí --</option>
                <option>Dưới 100.000đ/buổi</option>
                <option>100.000 – 150.000đ/buổi</option>
                <option>150.000 – 200.000đ/buổi</option>
                <option>200.000 – 300.000đ/buổi</option>
                <option>Trên 300.000đ/buổi</option>
                <option>Thỏa thuận</option>
              </select>
              {errors.fee && <p className="text-red-500 text-xs mt-1">{errors.fee}</p>}
            </Field>

            <Field label="Hình thức dạy" required>
              <div className="flex gap-3">
                {['Online', 'Trực tiếp', 'Cả hai'].map((v) => (
                  <label key={v} className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="tutor-format"
                      value={v}
                      className="sr-only"
                      checked={form.format === v}
                      onChange={() => set('format', v)}
                    />
                    <div
                      className={`text-center py-2.5 rounded-xl border-2 text-sm font-medium transition-colors ${
                        form.format === v
                          ? 'border-teal bg-teal-light text-teal'
                          : 'border-edge text-slate hover:border-teal/40'
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
                placeholder="VD: Quận 3, TP.HCM (không bắt buộc)"
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
                        ? 'border-teal bg-teal-light text-teal'
                        : 'border-edge text-slate hover:border-teal/40'
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
                  className="mt-1 w-4 h-4 accent-teal flex-shrink-0"
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
                className="w-full bg-teal text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity text-base"
              >
                Gửi thông tin
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
