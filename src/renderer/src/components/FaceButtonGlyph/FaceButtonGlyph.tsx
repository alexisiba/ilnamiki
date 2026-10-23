import styles from './FaceButtonGlyph.module.css'

export interface FaceButtonGlyphProps {
  label: string
  /** Name for assistive technology when the label is a symbol (e.g. "✕"). */
  accessibleLabel?: string
}

export function FaceButtonGlyph({
  label,
  accessibleLabel
}: FaceButtonGlyphProps): React.JSX.Element {
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
