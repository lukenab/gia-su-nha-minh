/* Replaceable logo component — swap SVG and text lockup when brand is finalised */
export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'sm' ? 32 : size === 'lg' ? 48 : 40

  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="40" height="40" rx="10" fill="#4361EE" />
        {/* House roof */}
        <path
          d="M7 21 L20 9 L33 21"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* House walls */}
        <rect
          x="10"
          y="21"
          width="20"
          height="11"
          rx="2"
          fill="rgba(255,255,255,0.15)"
          stroke="white"
          strokeWidth="2"
        />
        {/* Left person */}
        <circle cx="16" cy="26" r="2.5" fill="white" />
        {/* Right person */}
        <circle cx="24" cy="26" r="2.5" fill="white" />
        {/* Connection between people */}
        <path
          d="M18.5 26 L21.5 26"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="1.5 1.5"
        />
        {/* Open book at base */}
        <path
          d="M12 31 Q20 29 28 31"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <div className="leading-none">
        <div className="text-[11px] font-medium text-slate tracking-wide">Gia Sư</div>
        <div className="text-lg font-bold text-primary leading-tight">Nhà Mình</div>
      </div>
    </div>
  )
}
