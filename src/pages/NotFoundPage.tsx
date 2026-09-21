import { Link } from 'react-router-dom'
import { usePageMetadata } from '@/hooks/usePageMetadata'

export default function NotFoundPage() {
  usePageMetadata(
    'Không tìm thấy trang | Gia Sư Nhà Mình',
    'Trang bạn yêu cầu không tồn tại.',
    '/404',
  )

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 pt-16 text-center">
      <p className="mb-3 text-sm font-bold text-primary">404</p>
      <h1 className="mb-4 text-3xl font-bold text-navy">Không tìm thấy trang</h1>
      <p className="mb-8 text-slate">Đường dẫn có thể đã thay đổi hoặc không còn tồn tại.</p>
      <Link className="rounded-xl bg-primary px-6 py-3 font-semibold text-white" to="/">
        Về trang chủ
      </Link>
    </section>
  )
}
