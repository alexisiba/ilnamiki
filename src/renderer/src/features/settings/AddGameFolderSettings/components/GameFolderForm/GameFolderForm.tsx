import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { pickGameFolder } from '@renderer/core/ipc'

import { FormField } from '../../../components/FormField'
import { PathField } from '../../../components/PathField'
import { SettingsForm } from '../../../components/SettingsForm'
import { PlatformSelect } from '../PlatformSelect'
import type { GameFolderFormProps } from './GameFolderForm.types'

/**
 * The folder to find games in, typed or chosen with the system's folder picker (which only
 * accepts folders), and the platform its games belong to. Add folder is unavailable until
 * both are filled in; nothing is validated or saved yet.
 */
export function GameFolderForm({ platforms, onCancel }: GameFolderFormProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const [path, setPath] = useState('')
  const [platformId, setPlatformId] = useState<string>()
  const platformLabelId = useId()
  const platformControlId = useId()
  const complete = path.trim() !== '' && platformId !== undefined

  return (
    <SettingsForm
      id="add-game-folder-form"
      title={t('addGameFolder.title')}
      actions={
        <>
          <Button focusId="cancel" onPress={onCancel}>
            {t('addGameFolder.cancel')}
          </Button>
          <Button focusId="add" aria-disabled={!complete}>
            {t('addGameFolder.add')}
          </Button>
        </>
      }
    >
      <PathField
        label={t('addGameFolder.path')}
        browseLabel={t('addGameFolder.browse')}
        value={path}
        onChange={setPath}
        pick={pickGameFolder}
        autoFocus
      />
      <FormField
        label={t('addGameFolder.platform')}
        controlId={platformControlId}
        labelId={platformLabelId}
      >
        <PlatformSelect
          labelId={platformLabelId}
          controlId={platformControlId}
          platforms={platforms}
          value={platformId}
          onChange={setPlatformId}
        />
      </FormField>
    </SettingsForm>
  )
}
