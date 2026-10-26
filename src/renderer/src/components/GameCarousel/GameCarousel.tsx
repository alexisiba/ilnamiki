import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { Carousel } from '@renderer/components/Carousel'
import { playUiSound } from '@renderer/core/audio'
import { FocusGroup } from '@renderer/core/navigation'

import { FocusableGameCarouselItem } from './components/FocusableGameCarouselItem'
import { GameCarouselItem } from './components/GameCarouselItem'
import type { GameCarouselProps } from './GameCarousel.types'
import styles from './GameCarousel.module.css'

/**
 * Games in a carousel, with the selected one's facts (those known) below it. Either focus
 * stays elsewhere and the selection is announced (`statusId`), or the games take focus and the focused one
 * is the selected one (`focusGroupId`).
 */
export function GameCarousel(props: GameCarouselProps): React.JSX.Element | null {
  const { games, selectedIndex, onSelect } = props
  const { t } = useTranslation()
  const factsId = useId()
  const selected = games[selectedIndex]

  if (!selected) return null

  const select = (index: number): void => {
    // Focus coming back to the selected game (e.g. when shown) doesn't slide anything.
    if (index !== selectedIndex) playUiSound('carousel-slide')
    onSelect(index)
  }

  // Only what is known about the game; without any of it, the line is left out.
  const facts = [
    selected.releaseYear,
    selected.genre,
    selected.players !== null && t('gameCarousel.players', { count: selected.players })
  ].filter((fact) => fact !== null && fact !== false)
  const hasFacts = facts.length > 0

  const details = (
    <>
      {hasFacts && (
        <p id={factsId} className={styles.facts}>
          {facts.join(' · ')}
        </p>
      )}
      {props.statusId !== undefined && (
        // Focus stays elsewhere, so changing games is announced instead.
        <p id={props.statusId} className={styles.status} aria-live="polite">
          {t('gameCarousel.selected', {
            title: selected.title,
            position: selectedIndex + 1,
            total: games.length
          })}
        </p>
      )}
    </>
  )

  const carousel = (
    <Carousel selectedIndex={selectedIndex} spacing="var(--game-spacing)" details={details}>
      {games.map((game, index) =>
        props.focusGroupId === undefined ? (
          <GameCarouselItem
            key={game.id}
            game={game}
            selected={index === selectedIndex}
            onSelect={() => select(index)}
          />
        ) : (
          <FocusableGameCarouselItem
            key={game.id}
            game={game}
            selected={index === selectedIndex}
            focusOnShow={Boolean(props.focusOnShow) && index === selectedIndex}
            describedBy={index === selectedIndex && hasFacts ? factsId : undefined}
            onSelect={() => select(index)}
            onOpen={() => props.onOpen(game)}
          />
        )
      )}
    </Carousel>
  )

  if (props.focusGroupId === undefined) return carousel

  return <FocusGroup id={props.focusGroupId}>{carousel}</FocusGroup>
}
