/**
 * Everything the main process exposes to the renderer on `window.api`, one key per domain
 * (see the `main-renderer-api` skill). Empty until the first domain is added.
 */
export type Api = Record<string, never>
