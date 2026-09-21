import { useEffect } from 'react'
import { siteConfig } from '@/lib/config'

export function usePageMetadata(title: string, description: string, path = '/') {
  useEffect(() => {
    document.title = title

    const descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const canonicalTag = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')
    const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]')
    const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]')
    const canonicalUrl = new URL(path, siteConfig.url).toString()

    descriptionTag?.setAttribute('content', description)
    canonicalTag?.setAttribute('href', canonicalUrl)
    ogTitle?.setAttribute('content', title)
    ogDescription?.setAttribute('content', description)
    ogUrl?.setAttribute('content', canonicalUrl)
  }, [description, path, title])
}
