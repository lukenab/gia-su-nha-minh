import { Link } from 'react-router-dom'

const sizes = {
  sm: { width: 134, height: 40 },
  md: { width: 161, height: 48 },
  lg: { width: 188, height: 56 },
} as const

export default function Logo({ size = 'md' }: { size?: keyof typeof sizes }) {
  const dimensions = sizes[size]

  return (
    <Link
      to="/"
      className="inline-flex rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      aria-label="Gia Sư Nhà Mình — Trang chủ"
    >
      <img
        src="/logo-horizontal.svg?v=2"
        alt="Gia Sư Nhà Mình"
        width={dimensions.width}
        height={dimensions.height}
        className="block h-auto"
        draggable="false"
      />
    </Link>
  )
}
