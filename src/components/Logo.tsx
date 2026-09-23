import { Link } from 'react-router-dom'

const sizes = {
  sm: { width: 134, height: 40 },
  md: { width: 161, height: 48 },
  lg: { width: 188, height: 56 },
} as const

type LogoProps = {
  size?: keyof typeof sizes
  framed?: boolean
}

export default function Logo({ size = 'md', framed = false }: LogoProps) {
  const dimensions = sizes[size]
  const frameSpace = framed ? 16 : 0

  return (
    <Link
      to="/"
      className={`inline-flex shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${
        framed
          ? 'border border-primary/30 bg-white p-2 shadow-[0_8px_24px_rgba(15,23,42,0.18)]'
          : ''
      }`}
      style={{ width: dimensions.width + frameSpace, height: dimensions.height + frameSpace }}
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
