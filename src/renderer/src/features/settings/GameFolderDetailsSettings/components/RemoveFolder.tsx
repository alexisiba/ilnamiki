import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { removeGameFolder } from '@renderer/core/ipc'

import { ConfirmDialog } from '../../components/ConfirmDialog'
import type { RemoveFolderProps } from '../GameFolderDetailsSettings.types'

/** Remove folder, in red, which asks before removing the folder and its games from Ilnamiki. */
export function RemoveFolder({
  folder,
  platformName,
  onRemoved
}: RemoveFolderProps): React.JSX.Element {
  const { t } = useTranslation('settings')
  const [confirming, setConfirming] = useState(false)

  const remove = async (): Promise<void> => {
    setConfirming(false)
    await removeGameFolder(folder.id)
    onRemoved()
  }

  return (
    <>
      <Button focusId="remove" variant="danger" onPress={() => setConfirming(true)}>
        {t('gameFolderDetails.remove')}
      </Button>
      {confirming && (
        <ConfirmDialog
          title={t('gameFolderDetails.confirmRemove.title', { platform: platformName })}
          description={t('gameFolderDetails.confirmRemove.description')}
          cancelLabel={t('gameFolderDetails.confirmRemove.cancel')}
          confirmLabel={t('gameFolderDetails.confirmRemove.confirm')}
          destructive
          onConfirm={remove}
          onCancel={() => setConfirming(false)}
        />
      )}
    </>
  )
}
