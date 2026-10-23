import { Outlet, useLocation, useNavigate } from 'react-router'

import { ButtonGuide } from '@renderer/components/ButtonGuide'
import { TopBar } from '@renderer/components/TopBar'
import { useInputAction } from '@renderer/core/input'
import { isSectionRoot, NavigationProvider } from '@renderer/core/navigation'
import styles from './App.module.css'

function App(): React.JSX.Element {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // Back returns one level, from a screen inside a section to the previous one. A section's
  // root has nothing to go back to.
  useInputAction((action) => {
    if (action === 'back' && !isSectionRoot(pathname)) navigate(-1)
  })

  return (
    <NavigationProvider scope={pathname}>
      <div className={styles.app}>
        <TopBar />
        <main className={styles.screen}>
          <Outlet />
        </main>
        <ButtonGuide />
      </div>
    </NavigationProvider>
  )
}

export default App
