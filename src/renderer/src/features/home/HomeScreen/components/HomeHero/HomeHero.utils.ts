import type { TFunction } from 'i18next'

const RELATIVE_TIME_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['week', 7 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60]
]

/** Time elapsed since `date`, e.g. "2 days ago" / "hace 2 días". */
export function formatTimeSince(date: Date, now: Date, locale: string): string {
  const elapsedSeconds = Math.max(0, (now.getTime() - date.getTime()) / 1000)
  const [unit, unitSeconds] = RELATIVE_TIME_UNITS.find(
    ([, seconds]) => elapsedSeconds >= seconds
  ) ?? ['minute', 60]

  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
    -Math.floor(elapsedSeconds / unitSeconds),
    unit
  )
}

/** Total playtime as hours and minutes, e.g. "32 h 15 min". */
export function formatPlaytime(totalMinutes: number, t: TFunction<'home'>): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.round(totalMinutes % 60)

  if (hours === 0) return t('hero.duration.minutes', { minutes })
  if (minutes === 0) return t('hero.duration.hours', { hours })
  return t('hero.duration.hoursMinutes', { hours, minutes })
}
