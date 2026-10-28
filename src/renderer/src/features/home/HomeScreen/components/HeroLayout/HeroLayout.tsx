import { FocusGroup } from '@renderer/core/navigation'

import type { HeroLayoutProps } from './HeroLayout.types'
import styles from './HeroLayout.module.css'

/**
 * The top of Home: artwork on the right and, on the left, what it offers, a title, a
 * description, some facts and the actions. Each hero of Home fills it with its own content.
 */
export function HeroLayout({
  id,
  imageUrl,
  isPixelArt = false,
  badge,
  eyebrowIcon: EyebrowIcon,
  eyebrowIconStyle = 'filled',
  eyebrow,
  title,
  description,
  details,
  actions,
  message
}: HeroLayoutProps): React.JSX.Element {
  return (
    <FocusGroup id={id} as="section" className={styles.hero}>
      <img
        className={isPixelArt ? `${styles.artwork} ${styles.pixelArt}` : styles.artwork}
        src={imageUrl}
        alt=""
      />
      <div className={styles.content}>
        {badge}
        <p className={styles.eyebrow}>
          <EyebrowIcon
            className={
              eyebrowIconStyle === 'outline' ? styles.eyebrowIconOutline : styles.eyebrowIcon
            }
            aria-hidden
          />
          {eyebrow}
        </p>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
        <div className={styles.details}>{details}</div>
        <div className={styles.actions}>{actions}</div>
        {message}
      </div>
    </FocusGroup>
  )
}
