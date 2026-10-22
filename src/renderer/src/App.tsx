import { TopBar } from '@renderer/components/TopBar'
import { HomeScreen } from '@renderer/features/home'
import styles from './App.module.css'

function App(): React.JSX.Element {
  return (
    <div className={styles.app}>
      <TopBar defaultTab="home" />
      <main className={styles.screen}>
        <HomeScreen />
      </main>
    </div>
  )
}

export default App
