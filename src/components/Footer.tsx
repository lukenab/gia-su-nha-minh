import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="bg-navy text-white py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-4 max-w-xs">
              Nền tảng kết nối người học với gia sư dựa trên mục tiêu, lịch học và ngân sách. Đang trong giai đoạn nghiên cứu và phát triển.
            </p>
            <div className="flex gap-3">
              {/* Facebook placeholder */}
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Facebook fanpage"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm2 5.333h-1.333c-.294 0-.334.133-.334.467V7H10l-.2 2H8.333V15H6V9H4.667V7H6V5.667C6 4.133 6.933 3 8.8 3H10v2.333z" />
                </svg>
              </a>
              {/* Email placeholder */}
              <a
                href="mailto:contact@giasunhaminh.id.vn"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Email liên hệ"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M1 5l7 5 7-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Thông tin</div>
            <ul className="space-y-3">
              {['Về dự án', 'Cách hoạt động', 'Dành cho gia sư', 'Câu hỏi thường gặp'].map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">Liên hệ</div>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://giasunhaminh.id.vn"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  giasunhaminh.id.vn
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@giasunhaminh.id.vn"
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  contact@giasunhaminh.id.vn
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                  Điều khoản sử dụng
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © 2025 Gia Sư Nhà Mình. Dự án đang trong giai đoạn nghiên cứu.
          </p>
          <p className="text-xs text-white/30">
            Được xây dựng với mục tiêu hiểu rõ nhu cầu của người học và gia sư.
          </p>
        </div>
      </div>
    </footer>
  )
}
