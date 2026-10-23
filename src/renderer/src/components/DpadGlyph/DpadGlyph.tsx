import type { Direction } from '@renderer/core/input'

import styles from './DpadGlyph.module.css'

export interface DpadGlyphProps {
  direction: Direction
  accessibleLabel: string
}

const ARMS: Record<Direction, { x: number; y: number }> = {
  up: { x: 8, y: 1 },
  down: { x: 8, y: 15 },
  left: { x: 1, y: 8 },
  right: { x: 15, y: 8 }
}

export function DpadGlyph({ direction, accessibleLabel }: DpadGlyphProps): React.JSX.Element {
  return (
    <svg className={styles.glyph} viewBox="0 0 24 24" role="img" aria-label={accessibleLabel}>
      <rect className={styles.arm} x="8" y="8" width="8" height="8" />
      {Object.entries(ARMS).map(([arm, { x, y }]) => (
        <rect
          key={arm}
          className={arm === direction ? `${styles.arm} ${styles.armActive}` : styles.arm}
          x={x}
          y={y}
          width="8"
          height="8"
          rx="1.5"
        />
      ))}
    </svg>
  )
}
