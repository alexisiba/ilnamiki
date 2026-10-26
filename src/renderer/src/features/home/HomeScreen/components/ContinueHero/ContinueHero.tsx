import { Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@renderer/components/Button'
import { PlatformPill } from '@renderer/components/PlatformPill'
import { PlayStats } from '@renderer/components/PlayStats'

import { HeroLayout } from '../HeroLayout'
import type { ContinueHeroProps } from './ContinueHero.types'

/** Home's hero once a game was played: the last played game, ready to continue. */
export function ContinueHero({ game }: ContinueHeroProps): React.JSX.Element {
  const { t } = useTranslation('home')

  return (
    <HeroLayout
      id="home-hero"
      imageUrl={game.imageUrl}
      badge={<PlatformPill platform={game.platform} />}
      eyebrowIcon={Play}
      eyebrow={t('hero.resume')}
      title={game.title}
      description={game.description}
      details={
        <PlayStats lastPlayedAt={game.lastPlayedAt} playtimeMinutes={game.playtimeMinutes} />
      }
      actions={
        <Button focusId="continue" autoFocus>
          {t('hero.continue')}
        </Button>
      }
    />
  )
}
