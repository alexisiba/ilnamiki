import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'

import { ButtonHint } from '@renderer/components/ButtonHint'
import { isSectionRoot } from '@renderer/core/navigation'

import styles from './ButtonGuide.module.css'

/**
 * Bottom bar that explains the actions available on the current screen. Informative only:
 * it is never focused or clicked, and screen readers reach it as the "Controls" landmark.
 */
export function ButtonGuide(): React.JSX.Element {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  return (
    <footer className={styles.guide} aria-label={t('buttonGuide.label')}>
      <ul className={styles.hints}>
        <li>
          <ButtonHint action="confirm" label={t('buttonGuide.select')} />
        </li>
        {!isSectionRoot(pathname) && (
          <li>
            <ButtonHint action="back" label={t('buttonGuide.back')} />
          </li>
        )}
        <li>
          <ButtonHint action="tertiary" label={t('buttonGuide.search')} />
        </li>
        <li className={styles.pair}>
          <ButtonHint action="prevSection" />
          <ButtonHint action="nextSection" label={t('buttonGuide.switchTab')} />
        </li>
      </ul>
    </footer>
  )
}
