import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'

import { ButtonHint } from '@renderer/components/ButtonHint'
import { useActionEnabled, useContextualActions } from '@renderer/core/input'
import { isSectionRoot, useHasBackStep } from '@renderer/core/navigation'

import type { ButtonGuideProps } from './ButtonGuide.types'
import styles from './ButtonGuide.module.css'

const SECTION_ACTIONS = ['prevSection', 'nextSection'] as const

/**
 * Bottom bar that explains the actions available: those the current screen has on, or `hints`
 * when given (e.g. inside a dialog). Informative only: it is never focused or clicked, and
 * screen readers reach it as the "Controls" landmark.
 */
export function ButtonGuide({ hints }: ButtonGuideProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <footer className={styles.guide} aria-label={t('buttonGuide.label')}>
      <ul className={styles.hints}>
        {hints ? (
          hints.map((hint) => (
            <li key={hint.action}>
              <ButtonHint {...hint} />
            </li>
          ))
        ) : (
          <ScreenHints />
        )}
      </ul>
    </footer>
  )
}

/** The actions the current screen has on (see `useScreenActions`). */
function ScreenHints(): React.JSX.Element {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const canNavigate = [
    useActionEnabled('up'),
    useActionEnabled('down'),
    useActionEnabled('left'),
    useActionEnabled('right')
  ].includes(true)
  const canConfirm = useActionEnabled('confirm')
  // A section's root has nothing to go back to, unless it has a step back of its own.
  const hasBackStep = useHasBackStep()
  const canGoBack = useActionEnabled('back') && (!isSectionRoot(pathname) || hasBackStep)
  const contextualActions = useContextualActions()
  const canSwitchTab = {
    prevSection: useActionEnabled('prevSection'),
    nextSection: useActionEnabled('nextSection')
  }
  const sectionActions = SECTION_ACTIONS.filter((action) => canSwitchTab[action])

  return (
    <>
      {canNavigate && (
        <li>
          <ButtonHint action="navigate" label={t('buttonGuide.navigate')} />
        </li>
      )}
      {canConfirm && (
        <li>
          <ButtonHint action="confirm" label={t('buttonGuide.select')} />
        </li>
      )}
      {canGoBack && (
        <li>
          <ButtonHint action="back" label={t('buttonGuide.back')} />
        </li>
      )}
      {contextualActions.map(({ action, label }) => (
        <li key={action}>
          <ButtonHint action={action} label={label} />
        </li>
      ))}
      {sectionActions.length > 0 && (
        // The label goes on the last one, after both buttons when the pair is on.
        <li className={styles.pair}>
          {sectionActions.map((action, index) => (
            <ButtonHint
              key={action}
              action={action}
              label={index === sectionActions.length - 1 ? t('buttonGuide.switchTab') : undefined}
            />
          ))}
        </li>
      )}
    </>
  )
}
