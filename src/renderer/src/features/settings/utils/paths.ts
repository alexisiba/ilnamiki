/** Whether `path` is absolute: from the root on Linux and macOS, or a drive on Windows. */
export function isAbsolutePath(path: string): boolean {
  return path.startsWith('/') || /^[A-Za-z]:[\\/]/.test(path)
}
