import { Outlet, useLocation } from 'react-router'

import { TopBar } from '@renderer/components/TopBar'
import { NavigationProvider } from '@renderer/core/navigation'
import styles from './App.module.css'

function App(): React.JSX.Element {
  const { pathname } = useLocation()

  return (
    <NavigationProvider scope={pathname}>
      <div className={styles.app}>
        <TopBar />
        <main className={styles.screen}>
          <Outlet />
        </main>
      </div>
    </NavigationProvider>
  )
}

export default App
