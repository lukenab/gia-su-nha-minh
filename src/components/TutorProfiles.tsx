function SkeletonBlock({ w = 'w-full', h = 'h-3' }: { w?: string; h?: string }) {
  return <div className={`${w} ${h} bg-edge rounded-full animate-pulse`} />
}

function TutorCard({ initials, name, subject, group, method, schedule, fee, mode, color }: {
  initials: string
  name: string
  subject: string
  group: string
  method: string
  schedule: string
  fee: string
  mode: string
  color: string
}) {
  return (
    <div className="bg-surface rounded-2xl border border-edge p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-navy text-base truncate">{name}</div>
          <div className="text-xs text-slate truncate">{subject}</div>
        </div>
        <span className="text-[11px] bg-teal-light text-teal px-2 py-0.5 rounded-full font-medium flex-shrink-0">
          {mode}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2.5 text-sm">
        <div className="flex gap-2">
          <span className="text-slate w-32 flex-shrink-0">Nhóm phù hợp</span>
          <span className="text-navy font-medium">{group}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-slate w-32 flex-shrink-0">Phương pháp</span>
          <span className="text-navy font-medium">{method}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-slate w-32 flex-shrink-0">Lịch dạy</span>
          <span className="text-navy font-medium">{schedule}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-slate w-32 flex-shrink-0">Học phí dự kiến</span>
          <span className="text-orange font-semibold">{fee}</span>
        </div>
      </div>
    </div>
  )
}

function LoadingCard() {
  return (
    <div className="bg-surface rounded-2xl border border-edge p-5 shadow-sm opacity-60">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-edge animate-pulse" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock w="w-28" h="h-4" />
          <SkeletonBlock w="w-20" h="h-3" />
        </div>
      </div>
      <div className="space-y-3">
        <SkeletonBlock w="w-full" />
        <SkeletonBlock w="w-4/5" />
        <SkeletonBlock w="w-3/4" />
        <SkeletonBlock w="w-2/3" />
      </div>
    </div>
  )
}

const tutors = [
  {
    initials: 'TH',
    name: 'Nguyễn Thu H.',
    subject: 'Tiếng Anh giao tiếp & phỏng vấn',
    group: 'Sinh viên, người đi làm',
    method: 'Thực hành hội thoại, role-play',
    schedule: 'Tối T2, T3, T5',
    fee: '150.000 – 200.000đ/buổi',
    mode: 'Online',
    color: 'bg-gradient-to-br from-primary to-teal',
  },
  {
    initials: 'MK',
    name: 'Trần Minh K.',
    subject: 'Tiếng Anh nền tảng & IELTS',
    group: 'Học sinh THPT, sinh viên năm 1',
    method: 'Bài tập có cấu trúc, phản hồi chi tiết',
    schedule: 'Cuối tuần, tối T6',
    fee: '120.000 – 180.000đ/buổi',
    mode: 'Linh hoạt',
    color: 'bg-gradient-to-br from-teal to-primary',
  },
]

export default function TutorProfiles() {
  return (
    <section className="py-16 md:py-24 bg-section">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <div className="inline-block text-xs font-semibold text-orange bg-orange-light px-3 py-1.5 rounded-full mb-4 uppercase tracking-wide">
            Giao diện minh họa
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-navy mb-4">
            Hồ sơ giúp người học{' '}
            <span className="text-primary">hiểu rõ hơn trước khi kết nối</span>
          </h2>
          <p className="text-slate text-base md:text-lg max-w-2xl mx-auto">
            Dưới đây là ví dụ về định dạng hồ sơ chúng tôi đang phát triển. Đây là nội dung minh họa, chưa phải hồ sơ gia sư thực tế.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tutors.map((t) => (
            <TutorCard key={t.name} {...t} />
          ))}
          <LoadingCard />
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-slate italic">
            Tất cả thông tin trên là minh họa. Chưa có gia sư nào đang hoạt động trên nền tảng.
          </p>
        </div>
      </div>
    </section>
  )
}
