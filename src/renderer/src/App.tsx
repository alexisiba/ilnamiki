import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'

import { ButtonGuide } from '@renderer/components/ButtonGuide'
import { TopBar } from '@renderer/components/TopBar'
import { playUiSound, preloadUiSounds, startBackgroundMusic } from '@renderer/core/audio'
import { useInputAction } from '@renderer/core/input'
import {
  isSectionRoot,
  NavigationProvider,
  takeBackStep,
  useGoBack
} from '@renderer/core/navigation'
import { Search } from '@renderer/features/search'
import styles from './App.module.css'

function App(): React.JSX.Element {
  const { pathname } = useLocation()
  const goBack = useGoBack()

  // Back returns one level: a step back inside the screen when it has one, else to the screen
  // that opened it. It does not follow the history: tabs return to the screen a section was
  // left on, so the previous entry may belong to another section. A section's root has
  // nothing to go back to.
  useInputAction((action) => {
    if (action !== 'back') return
    if (takeBackStep()) {
      playUiSound('back')
      return
    }
    if (isSectionRoot(pathname)) return
    playUiSound('back')
    goBack()
  })

  useEffect(() => {
    preloadUiSounds()
    return startBackgroundMusic()
  }, [])

  return (
    <NavigationProvider scope={pathname}>
      <div className={styles.app}>
        <TopBar />
        <main className={styles.screen}>
          <Outlet />
        </main>
        <ButtonGuide />
      </div>
      <Search />
    </NavigationProvider>
  )
}

export default App
