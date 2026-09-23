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
      className="inline-flex shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      style={{ width: dimensions.width, height: dimensions.height }}
      aria-label="Gia Sư Nhà Mình — Trang chủ"
    >
      <img
        src="/logo-horizontal.svg?v=3"
        alt="Gia Sư Nhà Mình"
        width={dimensions.width}
        height={dimensions.height}
        decoding="sync"
        fetchPriority="high"
        className="block h-full w-full object-contain"
        draggable="false"
      />
    </Link>
  )
}
