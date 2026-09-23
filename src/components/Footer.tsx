import { Link } from 'react-router-dom'
import { siteConfig } from '@/lib/config'
import Logo from './Logo'

const informationLinks = [
  { to: '/#ve-du-an', label: 'Dành cho người học' },
  { to: '/#cach-hoat-dong', label: 'Quy trình kết nối' },
  { to: '/#danh-cho-gia-su', label: 'Dành cho gia sư' },
  { to: '/#cau-hoi-thuong-gap', label: 'Câu hỏi thường gặp' },
]

export default function Footer() {
  return (
    <footer id="site-footer" className="bg-navy pb-28 pt-12 text-white md:py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-10 grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="mb-5"><Logo size="lg" /></div>
            <p className="mb-5 max-w-md text-sm leading-relaxed text-white/65">
              Dịch vụ kết nối sinh viên tại Cần Thơ với gia sư tiếng Anh dựa trên mục tiêu, lịch học, ngân sách và hình thức học.
            </p>
            <a
              href={siteConfig.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              <svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm2 5.333H8.667c-.294 0-.334.133-.334.467V7H10l-.2 2H8.333v6H6V9H4.667V7H6V5.667C6 4.133 6.933 3 8.8 3H10v2.333Z" /></svg>
              Facebook Gia Sư Nhà Mình
            </a>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold text-white">Thông tin</h2>
            <ul className="space-y-3">
              {informationLinks.map((link) => <li key={link.to}><Link className="text-sm text-white/60 transition-colors hover:text-white" to={link.to}>{link.label}</Link></li>)}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold text-white">Pháp lý và liên hệ</h2>
            <ul className="space-y-3">
              <li><a href={siteConfig.url} className="text-sm text-white/60 transition-colors hover:text-white">giasunhaminh.id.vn</a></li>
              <li><Link className="text-sm text-white/60 transition-colors hover:text-white" to="/privacy">Chính sách bảo mật</Link></li>
              <li><Link className="text-sm text-white/60 transition-colors hover:text-white" to="/terms">Điều khoản sử dụng</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Gia Sư Nhà Mình. Bảo lưu mọi quyền.</p>
          <p>Kết nối phù hợp bắt đầu từ nhu cầu rõ ràng.</p>
        </div>
      </div>
    </footer>
  )
}
