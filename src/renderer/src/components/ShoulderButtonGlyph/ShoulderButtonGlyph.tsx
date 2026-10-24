import styles from './ShoulderButtonGlyph.module.css'

export interface ShoulderButtonGlyphProps {
  label: string
}

export function ShoulderButtonGlyph({ label }: ShoulderButtonGlyphProps): React.JSX.Element {
  return <span className={styles.glyph}>{label}</span>
}
