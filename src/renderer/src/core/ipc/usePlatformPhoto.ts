import { useEffect, useState } from 'react'

import { findPlatformPhoto, getPlatformPhoto } from './platforms'

export interface PlatformPhotoState {
  /** `loading` until main first answers; `ready` after, even when it has no photo. */
  status: 'loading' | 'ready'
  /** URL of the photo; null when there is none or main failed. */
  url: string | null
}

/**
 * The photo of the console of `platformId`, asked to main on mount and when it changes. One
 * already got this session shows at once.
 */
export function usePlatformPhoto(platformId: string): PlatformPhotoState {
  // Kept with the platform it belongs to, so another platform's photo never shows.
  const [read, setRead] = useState<{ platformId: string; url: string | null }>()

  useEffect(() => {
    if (findPlatformPhoto(platformId)) return
    let active = true
    getPlatformPhoto(platformId).then(
      (url) => {
        if (active) setRead({ platformId, url })
      },
      () => {
        if (active) setRead({ platformId, url: null })
      }
    )
    return () => {
      active = false
    }
  }, [platformId])

  const known = findPlatformPhoto(platformId)
  if (known) return { status: 'ready', url: known }
  if (read?.platformId === platformId) return { status: 'ready', url: read.url }
  return { status: 'loading', url: null }
}
