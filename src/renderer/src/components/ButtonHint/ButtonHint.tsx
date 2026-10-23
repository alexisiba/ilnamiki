import { useTranslation } from 'react-i18next'

import { DpadGlyph } from '@renderer/components/DpadGlyph'
import { FaceButtonGlyph } from '@renderer/components/FaceButtonGlyph'
import { KeyGlyph } from '@renderer/components/KeyGlyph'
import { ShoulderButtonGlyph } from '@renderer/components/ShoulderButtonGlyph'
import { getButtonGlyph, useActiveInputDevice } from '@renderer/core/input'

import type { ButtonHintProps } from './ButtonHint.types'
import styles from './ButtonHint.module.css'

/** Shows the button for `action` on the active input device, with an optional label. */
export function ButtonHint({ action, label }: ButtonHintProps): React.JSX.Element {
  const { t } = useTranslation()
  const glyph = getButtonGlyph(action, useActiveInputDevice())

  const renderGlyph = (): React.JSX.Element => {
    switch (glyph.shape) {
      case 'face':
        return (
          <FaceButtonGlyph
            label={glyph.label}
            accessibleLabel={glyph.accessibleLabelKey && t(glyph.accessibleLabelKey)}
          />
        )
      case 'shoulder':
        return <ShoulderButtonGlyph label={glyph.label} />
      case 'dpad':
        return (
          <DpadGlyph
            direction={glyph.direction}
            accessibleLabel={t(`glyphs.dpad.${glyph.direction}`)}
          />
        )
      case 'key':
        return (
          <KeyGlyph
            label={'labelKey' in glyph ? t(glyph.labelKey) : glyph.label}
            accessibleLabel={glyph.accessibleLabelKey && t(glyph.accessibleLabelKey)}
          />
        )
    }
  }

  return (
    <span className={styles.hint}>
      {renderGlyph()}
      {label && <span className={styles.label}>{label}</span>}
    </span>
  )
}
