export interface SearchDialogProps {
  onClose: () => void
}

export interface SearchFieldProps {
  value: string
  onChange: (value: string) => void
}
