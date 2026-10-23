import styles from './KeyGlyph.module.css'

export interface KeyGlyphProps {
  label: string
  /** Name for assistive technology when the label is a symbol (e.g. "↑"). */
  accessibleLabel?: string
}

export function KeyGlyph({ label, accessibleLabel }: KeyGlyphProps): React.JSX.Element {
  return (
    <span
      className={styles.glyph}
      role={accessibleLabel ? 'img' : undefined}
      aria-label={accessibleLabel}
    >
      {label}
    </span>
  )
}
