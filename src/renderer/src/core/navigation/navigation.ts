import type { Direction } from '@renderer/core/input'

import { scrollFocusIntoView } from './scroll'
import { findNextInDirection, isInBeam, type SpatialCandidate } from './spatial'

export interface FocusItem {
  /** Unique across the app: `<group id>/<item id>`. Used to remember and restore focus. */
  key: string
  groupId: string | undefined
  element: HTMLElement
  /** Whether the item takes focus when its screen opens, unless focus is restored elsewhere. */
  autoFocus: boolean
}

export interface FocusGroup {
  id: string
  element: HTMLElement
  /** How the focused item is scrolled into view inside its scroll container. */
  scrollAlign: 'nearest' | 'start'
}

export interface Navigation {
  /** Sets the current screen; focus is remembered and restored per scope. */
  setScope: (scope: string) => void
  registerItem: (item: FocusItem) => () => void
  registerGroup: (group: FocusGroup) => () => void
  move: (direction: Direction) => void
  confirm: () => void
  /** Focuses `element` when the pointer actually moves over it. */
  pointerMove: (element: HTMLElement, event: PointerEvent) => void
  /** Focuses `element` when it is pressed, for items that do not take focus on hover. */
  pointerDown: (element: HTMLElement) => void
  /** Moves focus to the item of `element`, e.g. to results that just appeared. */
  focusElement: (element: HTMLElement) => void
  /** Id of the item last focused in a group, the one focus returns to when entering it again. */
  lastFocusedIn: (groupId: string) => string | undefined
  /** Keeps a screen's state while the app runs, so the screen looks the same when it returns. */
  remember: (key: string, value: unknown) => void
  /** State kept with `remember`, if any. */
  recall: (key: string) => unknown
}

/**
 * Claims on the initial focus of a screen, from weakest to strongest. Once the user moves
 * focus, nothing claims it until the screen changes or the focused item goes away.
 */
const CLAIM = { none: 0, first: 1, autoFocus: 2, restored: 3, user: Infinity } as const

const rectOf = (item: FocusItem): DOMRect => item.element.getBoundingClientRect()

const toCandidates = (items: FocusItem[]): SpatialCandidate<FocusItem>[] =>
  items.map((item) => ({ item, rect: rectOf(item) }))

/** Focus state shared by every focusable element of the app. */
export function createNavigation(): Navigation {
  const items = new Map<HTMLElement, FocusItem>()
  const groups = new Map<string, FocusGroup>()
  /** Last focused item key per group, to return to it when re-entering the group. */
  const groupMemory = new Map<string, string>()
  /** Last focused item key per scope, to restore it when coming back to the screen. */
  const scopeMemory = new Map<string, string>()
  /** State screens keep while the app runs, by key. */
  const stateMemory = new Map<string, unknown>()

  let scope = ''
  /** Item to restore in the current scope, read when the scope opened. */
  let restoreKey: string | undefined
  let focusedKey: string | undefined
  let claim: number = CLAIM.none
  let lastPointer: { x: number; y: number } | undefined

  const findByKey = (key: string | undefined): FocusItem | undefined =>
    key === undefined ? undefined : [...items.values()].find((item) => item.key === key)

  const focus = (item: FocusItem, scroll: ScrollBehavior | false): void => {
    item.element.focus({ preventScroll: true })
    focusedKey = item.key
    if (item.groupId !== undefined) groupMemory.set(item.groupId, item.key)
    scopeMemory.set(scope, item.key)

    if (scroll === false) return
    const group = item.groupId === undefined ? undefined : groups.get(item.groupId)
    scrollFocusIntoView(item.element, group, scroll)
  }

  const claimOf = (item: FocusItem): number => {
    if (restoreKey === item.key) return CLAIM.restored
    return item.autoFocus ? CLAIM.autoFocus : CLAIM.first
  }

  /** Focuses the best initial item: restored, else auto-focused, else the first one. */
  const focusInitial = (): void => {
    let best: FocusItem | undefined
    for (const item of items.values()) {
      if (!best || claimOf(item) > claimOf(best)) best = item
    }
    if (best) focus(best, 'instant')
  }

  const focusedItem = (): FocusItem | undefined =>
    document.activeElement instanceof HTMLElement ? items.get(document.activeElement) : undefined

  return {
    setScope(nextScope) {
      if (nextScope === scope) return
      scope = nextScope
      restoreKey = scopeMemory.get(scope)
      claim = CLAIM.none
    },

    registerItem(item) {
      items.set(item.element, item)

      const itemClaim = claimOf(item)
      if (itemClaim > claim) {
        claim = itemClaim
        focus(item, 'instant')
      }

      return () => {
        items.delete(item.element)
        // Losing the focused item lets the next items that appear claim focus again.
        if (focusedKey === item.key) claim = CLAIM.none
      }
    },

    registerGroup(group) {
      groups.set(group.id, group)
      return () => {
        groups.delete(group.id)
      }
    },

    move(direction) {
      const current = focusedItem()
      claim = CLAIM.user
      if (!current) {
        focusInitial()
        return
      }

      const from = rectOf(current)
      const others = [...items.values()].filter((item) => item !== current)
      const inGroup = others.filter((item) => item.groupId === current.groupId)

      let target = findNextInDirection(from, toCandidates(inGroup), direction)

      if (!target) {
        // Leaving the group: prefer what is straight ahead. Vertically, fall back to anything
        // in that direction; horizontally, stop at the edge of the row.
        const outside = toCandidates(others.filter((item) => item.groupId !== current.groupId))
        const ahead = outside.filter(({ rect }) => isInBeam(from, rect, direction))
        const vertical = direction === 'up' || direction === 'down'
        const next =
          findNextInDirection(from, ahead, direction) ??
          (vertical ? findNextInDirection(from, outside, direction) : undefined)

        target =
          next && next.groupId !== undefined
            ? (findByKey(groupMemory.get(next.groupId)) ?? next)
            : next
      }

      if (target) focus(target, 'auto')
    },

    confirm() {
      focusedItem()?.element.click()
    },

    pointerMove(element, event) {
      // Content scrolling under a still pointer can report a move without one; ignore it.
      const position = { x: event.clientX, y: event.clientY }
      const moved = !lastPointer || lastPointer.x !== position.x || lastPointer.y !== position.y
      lastPointer = position

      const item = items.get(element)
      if (!moved || !item || document.activeElement === element) return

      claim = CLAIM.user
      // Never scroll on hover: it would slide other items under the pointer.
      focus(item, false)
    },

    pointerDown(element) {
      const item = items.get(element)
      if (!item || document.activeElement === element) return

      claim = CLAIM.user
      focus(item, false)
    },

    focusElement(element) {
      const item = items.get(element)
      if (!item) return

      claim = CLAIM.user
      focus(item, 'auto')
    },

    lastFocusedIn(groupId) {
      return groupMemory.get(groupId)?.slice(`${groupId}/`.length)
    },

    remember(key, value) {
      stateMemory.set(key, value)
    },

    recall(key) {
      return stateMemory.get(key)
    }
  }
}
