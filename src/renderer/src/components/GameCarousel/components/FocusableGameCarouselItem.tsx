import { useEffect, useRef } from 'react'

import { playUiSound } from '@renderer/core/audio'
import { useFocusable } from '@renderer/core/navigation'

import type { FocusableGameCarouselItemProps } from '../GameCarousel.types'
import styles from '../GameCarousel.module.css'
import { GameCarouselCover } from './GameCarouselCover'

/**
 * A game in the carousel that takes focus, which selects it. It does not take focus on hover:
 * focusing slides it to the center, away from the pointer. Confirming it or clicking it while
 * selected opens it; clicking it while beside the selection selects it.
 */
export function FocusableGameCarouselItem({
  game,
  selected,
  focusOnShow,
  describedBy,
  onSelect,
  onOpen
}: FocusableGameCarouselItemProps): React.JSX.Element {
  // Only opening it sounds: a click that selects it slides the carousel instead.
  const { ref, focus } = useFocusable<HTMLButtonElement>({
    id: game.id,
    focusOnHover: false,
    sound: false
  })
  // Read before the press focuses (and so selects) the game, in the capture phase.
  const pressedWhileSelected = useRef(false)

  // Only when shown: later renders must not pull focus back.
  const focusWhenShown = useRef(focusOnShow)
  useEffect(() => {
    if (focusWhenShown.current) focus()
  }, [focus])

  const handleClick = (event: React.MouseEvent): void => {
    // A confirm clicks the element without a pointer press (detail 0).
    if (event.detail !== 0 && !pressedWhileSelected.current) return
    playUiSound('select')
    onOpen()
  }

  return (
    <button
      ref={ref}
      type="button"
      className={selected ? `${styles.item} ${styles.selected}` : styles.item}
      aria-current={selected ? 'true' : undefined}
      aria-describedby={describedBy}
      onFocus={onSelect}
      onPointerDownCapture={() => {
        pressedWhileSelected.current = selected
      }}
      onClick={handleClick}
    >
      <GameCarouselCover game={game} />
    </button>
  )
}
