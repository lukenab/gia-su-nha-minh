export const siteConfig = {
  name: 'Gia Sư Nhà Mình',
  url: import.meta.env.VITE_SITE_URL || 'https://giasunhaminh.id.vn',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || '',
  facebookUrl: import.meta.env.VITE_FACEBOOK_URL || '',
} as const
