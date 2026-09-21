import { Link } from 'react-router-dom'
import { siteConfig } from '@/lib/config'
import Logo from './Logo'

const informationLinks = [
  { to: '/#ve-du-an', label: 'Về dự án' },
  { to: '/#cach-hoat-dong', label: 'Cách hoạt động' },
  { to: '/#danh-cho-gia-su', label: 'Dành cho gia sư' },
  { to: '/#cau-hoi-thuong-gap', label: 'Câu hỏi thường gặp' },
]

export default function Footer() {
  return (
    <footer id="site-footer" className="bg-navy pb-28 pt-12 text-white md:py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-10 grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-4"><Logo /></div>
            <p className="mb-4 max-w-sm text-sm leading-relaxed text-white/65">
              Dự án kết nối sinh viên tại Cần Thơ với gia sư tiếng Anh theo mục tiêu, lịch học và ngân sách. Hiện đang trong giai đoạn nghiên cứu nhu cầu.
            </p>
            {(siteConfig.facebookUrl || siteConfig.contactEmail) && (
              <div className="flex gap-3">
                {siteConfig.facebookUrl && (
                  <a
                    href={siteConfig.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20"
                    aria-label="Facebook fanpage"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm2 5.333H8.667c-.294 0-.334.133-.334.467V7H10l-.2 2H8.333v6H6V9H4.667V7H6V5.667C6 4.133 6.933 3 8.8 3H10v2.333z" />
                    </svg>
                  </a>
                )}
                {siteConfig.contactEmail && (
                  <a
                    href={`mailto:${siteConfig.contactEmail}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20"
                    aria-label="Email liên hệ"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M1 5l7 5 7-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/45">Thông tin</div>
            <ul className="space-y-3">
              {informationLinks.map((link) => (
                <li key={link.to}>
                  <Link className="text-sm text-white/65 transition-colors hover:text-white" to={link.to}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/45">Dự án</div>
            <ul className="space-y-3">
              <li>
                <a
                  href={siteConfig.url}
                  className="text-sm text-white/65 transition-colors hover:text-white"
                >
                  giasunhaminh.id.vn
                </a>
              </li>
              <li><Link className="text-sm text-white/65 transition-colors hover:text-white" to="/privacy">Chính sách bảo mật</Link></li>
              <li><Link className="text-sm text-white/65 transition-colors hover:text-white" to="/terms">Điều khoản sử dụng</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 md:flex-row">
          <p className="text-xs text-white/45">
            © {new Date().getFullYear()} Gia Sư Nhà Mình. Dự án sinh viên đang trong giai đoạn nghiên cứu.
          </p>
          <p className="text-xs text-white/35">Chưa cung cấp dịch vụ kết nối gia sư chính thức.</p>
        </div>
      </div>
    </footer>
  )
}
