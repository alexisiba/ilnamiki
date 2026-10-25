/** A folder the user added for Ilnamiki to find games in. Its data is never translated. */
export interface GameFolder {
  id: string
  /** Name of the platform its games belong to, e.g. "Nintendo 64". */
  platform: string
  /** Number of games found in it. */
  gameCount: number
}
