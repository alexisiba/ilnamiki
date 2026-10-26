import { useId, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { pickGameFolder } from '@renderer/core/ipc'

import { FormField } from '../../../components/FormField'
import { PathField } from '../../../components/PathField'
import { SettingsForm } from '../../../components/SettingsForm'
import { scanProblemMessageKey } from '../../../utils/gameFolderProblems'
import { isAbsolutePath } from '../../../utils/paths'
import { PlatformSelect } from '../PlatformSelect'
import type { GameFolderFormProps } from './GameFolderForm.types'
import styles from './GameFolderForm.module.css'

/**
 * The folder to find games in, typed or chosen with the system's folder picker (which only
 * accepts folders), and the platform its games belong to, one folder per platform. Scan is
 * unavailable until both are filled in; why a folder can't be scanned shows below its path.
 */
export function GameFolderForm({
  platforms,
  initialPath,
  initialPlatformId,
  problemMessage,
  onCancel,
  onScan
}: GameFolderFormProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const [path, setPath] = useState(initialPath)
  const [platformId, setPlatformId] = useState(initialPlatformId)
  // The problem shows until the folder or the platform changes.
  const [problem, setProblem] = useState(problemMessage)
  const platformLabelId = useId()
  const platformControlId = useId()
  const platformNoteId = useId()
  const complete = path.trim() !== '' && platformId !== undefined

  const changePath = (nextPath: string): void => {
    setPath(nextPath)
    setProblem(undefined)
  }

  const changePlatform = (nextPlatformId: string): void => {
    setPlatformId(nextPlatformId)
    setProblem(undefined)
  }

  const scan = (): void => {
    const folderPath = path.trim()
    if (platformId === undefined) return
    if (!isAbsolutePath(folderPath)) {
      setProblem(t(scanProblemMessageKey('relative-path')))
      return
    }
    onScan({ path: folderPath, platformId })
  }

  return (
    <SettingsForm
      id="add-game-folder-form"
      title={t('addGameFolder.title')}
      actions={
        <>
          <Button focusId="cancel" onPress={onCancel}>
            {t('addGameFolder.cancel')}
          </Button>
          <Button focusId="scan" aria-disabled={!complete} onPress={scan}>
            {t('addGameFolder.scan')}
          </Button>
        </>
      }
    >
      <PathField
        label={t('addGameFolder.path')}
        browseLabel={t('addGameFolder.browse')}
        value={path}
        onChange={changePath}
        pick={pickGameFolder}
        error={problem}
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
          descriptionId={platformNoteId}
          platforms={platforms}
          value={platformId}
          onChange={changePlatform}
        />
        <p id={platformNoteId} className={styles.note}>
          {t('addGameFolder.onePerPlatform')}
        </p>
      </FormField>
    </SettingsForm>
  )
}
