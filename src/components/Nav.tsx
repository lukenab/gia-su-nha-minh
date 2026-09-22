import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import { useFormContext } from '@/context/FormModalContext'

const links = [
  { href: '#ve-du-an', label: 'Dành cho người học' },
  { href: '#cach-hoat-dong', label: 'Cách hoạt động' },
  { href: '#danh-cho-gia-su', label: 'Dành cho gia sư' },
  { href: '#cau-hoi-thuong-gap', label: 'FAQ' },
]

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { openLearnerForm } = useFormContext()

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 16)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled ? 'bg-white/95 shadow-[0_8px_30px_rgba(30,41,59,0.08)] backdrop-blur-md' : 'bg-white/95'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              to={`/${l.href}`}
              className="rounded-md text-sm font-medium text-slate transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <button
            onClick={() => openLearnerForm()}
            className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-colors"
          >
            Tìm gia sư
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={menuOpen}
        >
          <span
            className={`block w-6 h-0.5 bg-navy transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}
          />
          <span
            className={`block w-6 h-0.5 bg-navy transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`}
          />
          <span
            className={`block w-6 h-0.5 bg-navy transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="space-y-1 bg-white px-4 pb-6 pt-4 shadow-lg md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              to={`/${l.href}`}
              onClick={() => setMenuOpen(false)}
              className="block w-full border-b border-edge py-3 text-left text-base font-medium text-navy transition-colors last:border-0 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-4">
            <button
              onClick={() => {
                setMenuOpen(false)
                openLearnerForm()
              }}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-xl text-base"
            >
              Gửi yêu cầu tìm gia sư
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
