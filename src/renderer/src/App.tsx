import { Outlet } from 'react-router'

import { TopBar } from '@renderer/components/TopBar'
import styles from './App.module.css'

function App(): React.JSX.Element {
  return (
    <div className={styles.app}>
      <TopBar />
      <main className={styles.screen}>
        <Outlet />
      </main>
    </div>
  )
}

export default App
