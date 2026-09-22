import type { ReactNode } from 'react'

export type IconName =
  | 'target'
  | 'level'
  | 'calendar'
  | 'wallet'
  | 'laptop'
  | 'sliders'
  | 'clock'
  | 'shield'
  | 'identity'
  | 'certificate'
  | 'experience'
  | 'profile'
  | 'message'
  | 'inbox'
  | 'clipboard'
  | 'search'
  | 'check'
  | 'location'
  | 'book'

const icons: Record<IconName, ReactNode> = {
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /><path d="m15 9 5-5M16 4h4v4" /></>,
  level: <><path d="M4 19V9M10 19V5M16 19v-7M22 19V8" /><path d="M2 19h22" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
  wallet: <><path d="M4 6h14a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V7a3 3 0 0 1 3-3h13" /><path d="M16 12h6v4h-6a2 2 0 0 1 0-4Z" /></>,
  laptop: <><rect x="4" y="4" width="16" height="12" rx="2" /><path d="M2 20h20M9 20h6" /></>,
  sliders: <><path d="M4 6h8M16 6h4M4 12h3M11 12h9M4 18h10M18 18h2" /><circle cx="14" cy="6" r="2" /><circle cx="9" cy="12" r="2" /><circle cx="16" cy="18" r="2" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6l4 2" /></>,
  shield: <><path d="M12 3 4 6v5c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10V6Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
  identity: <><rect x="3" y="5" width="18" height="14" rx="3" /><circle cx="9" cy="11" r="2.5" /><path d="M5.5 17c.7-2 1.8-3 3.5-3s2.8 1 3.5 3M15 10h3M15 14h3" /></>,
  certificate: <><rect x="5" y="3" width="14" height="13" rx="2" /><path d="M9 7h6M9 11h4M9 16v5l3-2 3 2v-5" /></>,
  experience: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5h6v2M3 12h18M10 12v2h4v-2" /></>,
  profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></>,
  message: <><path d="M21 14a4 4 0 0 1-4 4H9l-5 3v-7a4 4 0 0 1-1-2.7V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" /><path d="M8 9h8M8 13h5" /></>,
  inbox: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 14h5l2 3h4l2-3h5M8 8h8M8 11h5" /></>,
  clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M8.5 9h7M8.5 13h7M8.5 17h4" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  book: <><path d="M3 5a4 4 0 0 1 4-2h5v17H7a4 4 0 0 0-4 2ZM21 5a4 4 0 0 0-4-2h-5v17h5a4 4 0 0 1 4 2Z" /></>,
}

export default function Icon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  )
}
