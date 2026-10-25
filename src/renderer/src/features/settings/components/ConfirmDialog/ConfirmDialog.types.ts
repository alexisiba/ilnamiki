export interface ConfirmDialogProps {
  /** The question, e.g. "Remove RetroArch?". */
  title: string
  /** What confirming does. */
  description: string
  cancelLabel: string
  confirmLabel: string
  /** Whether confirming destroys something: the confirm button turns red. */
  destructive?: boolean
  onConfirm: () => void
  /** Closes without doing anything: Cancel, back, or a click outside. */
  onCancel: () => void
}
