import type { FolderReader } from '../library.types'

/** Operating systems Ilnamiki can't read folders on yet can't read any. */
export const unsupportedFolderReader: FolderReader = {
  read: async () => ({ ok: false, problem: 'not-readable' })
}
