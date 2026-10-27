/** Platform ids are short words, e.g. "nintendo_64". */
const PLATFORM_ID_PATTERN = /^[\w-]{1,100}$/

/** `value` as a platform id, or null when it can't be one. */
export function parsePlatformId(value: unknown): string | null {
  return typeof value === 'string' && PLATFORM_ID_PATTERN.test(value) ? value : null
}
