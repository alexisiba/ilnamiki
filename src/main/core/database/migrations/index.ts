import type { Migration } from '../migrate'

/**
 * The app's schema history, oldest first. Add a migration at the end for every schema change;
 * never edit or remove one that has been released.
 */
export const MIGRATIONS: Migration[] = []
