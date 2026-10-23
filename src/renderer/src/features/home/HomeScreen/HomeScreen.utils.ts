const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_DAYS = 7

const startOfDay = (date: Date): number =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()

/**
 * Short "last played" label: the time if today, "yesterday", the weekday within the last
 * week, and the date otherwise (with the year only when it is not the current one).
 */
export function formatLastPlayed(date: Date, now: Date, locale: string): string {
  const daysAgo = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS)

  if (daysAgo <= 0) {
    return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(date)
  }
  if (daysAgo === 1) {
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-1, 'day')
  }
  if (daysAgo < WEEK_DAYS) {
    return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date)
  }
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric'
  }).format(date)
}
