import { Outlet } from 'react-router-dom'
import Footer from '@/components/Footer'
import Nav from '@/components/Nav'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-page font-sans">
      <Nav />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
