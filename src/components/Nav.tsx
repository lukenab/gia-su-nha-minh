import { useState, useEffect } from 'react'
import Logo from './Logo'
import { useFormContext } from '../App'

const links = [
  { href: '#ve-du-an', label: 'Về dự án' },
  { href: '#cach-hoat-dong', label: 'Cách hoạt động' },
  { href: '#danh-cho-gia-su', label: 'Dành cho gia sư' },
  { href: '#cau-hoi-thuong-gap', label: 'Câu hỏi thường gặp' },
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

  function handleNavClick(href: string) {
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-edge' : 'bg-white'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-between h-16">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <button
              key={l.href}
              onClick={() => handleNavClick(l.href)}
              className="text-sm font-medium text-slate hover:text-primary transition-colors"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:block">
          <button
            onClick={() => openLearnerForm()}
            className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-dark transition-colors"
          >
            Đăng ký quan tâm
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
        <div className="md:hidden bg-white border-t border-edge px-4 pb-6 pt-4 space-y-1">
          {links.map((l) => (
            <button
              key={l.href}
              onClick={() => handleNavClick(l.href)}
              className="block w-full text-left py-3 text-base font-medium text-navy hover:text-primary transition-colors border-b border-edge last:border-0"
            >
              {l.label}
            </button>
          ))}
          <div className="pt-4">
            <button
              onClick={() => {
                setMenuOpen(false)
                openLearnerForm()
              }}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-xl text-base"
            >
              Đăng ký quan tâm
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
