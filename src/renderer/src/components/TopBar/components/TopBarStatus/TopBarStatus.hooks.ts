import { useEffect, useState } from 'react'

const MINUTE_MS = 60_000

/** Current time, refreshed at the start of every minute. */
export function useCurrentTime(): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    const scheduleNextTick = (): void => {
      timer = setTimeout(
        () => {
          setNow(new Date())
          scheduleNextTick()
        },
        MINUTE_MS - (Date.now() % MINUTE_MS)
      )
    }

    scheduleNextTick()
    return () => clearTimeout(timer)
  }, [])

  return now
}
