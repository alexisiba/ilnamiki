import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { Carousel } from '@renderer/components/Carousel'
import { FocusGroup } from '@renderer/core/navigation'

import { FocusableGameCarouselItem } from './components/FocusableGameCarouselItem'
import { GameCarouselItem } from './components/GameCarouselItem'
import type { GameCarouselProps } from './GameCarousel.types'
import styles from './GameCarousel.module.css'

/**
 * Games in a carousel, with the selected one's facts below it. Either focus stays elsewhere
 * and the selection is announced (`statusId`), or the games take focus and the focused one
 * is the selected one (`focusGroupId`).
 */
export function GameCarousel(props: GameCarouselProps): React.JSX.Element | null {
  const { games, selectedIndex, onSelect } = props
  const { t } = useTranslation()
  const factsId = useId()
  const selected = games[selectedIndex]

  if (!selected) return null

  const facts = [
    selected.releaseYear,
    selected.genre,
    t('gameCarousel.players', { count: selected.players })
  ]

  const details = (
    <>
      <p id={factsId} className={styles.facts}>
        {facts.join(' · ')}
      </p>
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
            onSelect={() => onSelect(index)}
          />
        ) : (
          <FocusableGameCarouselItem
            key={game.id}
            game={game}
            selected={index === selectedIndex}
            focusOnShow={Boolean(props.focusOnShow) && index === selectedIndex}
            describedBy={index === selectedIndex ? factsId : undefined}
            onSelect={() => onSelect(index)}
            onOpen={() => props.onOpen(game)}
          />
        )
      )}
    </Carousel>
  )

  if (props.focusGroupId === undefined) return carousel

  return <FocusGroup id={props.focusGroupId}>{carousel}</FocusGroup>
}
