/** Operating systems Ilnamiki can read the system on. */
export type Platform = 'linux' | 'windows' | 'macos'

const PLATFORMS: Partial<Record<NodeJS.Platform, Platform>> = {
  linux: 'linux',
  win32: 'windows',
  darwin: 'macos'
}

/** Ilnamiki's platform for a Node.js platform id, or null when Ilnamiki does not support it. */
export function toPlatform(nodePlatform: NodeJS.Platform): Platform | null {
  return PLATFORMS[nodePlatform] ?? null
}

/** The platform the app is running on, or null when Ilnamiki does not support it. */
export const currentPlatform: Platform | null = toPlatform(process.platform)

/**
 * The implementation for `platform` (the current one by default), or `fallback` when that
 * platform has none. Services call this once to pick their provider.
 */
export function selectForPlatform<T>(
  implementations: Partial<Record<Platform, T>>,
  fallback: T,
  platform: Platform | null = currentPlatform
): T {
  if (platform === null) return fallback
  return implementations[platform] ?? fallback
}
