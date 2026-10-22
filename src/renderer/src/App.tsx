import type { CSSProperties } from 'react'
import styles from './App.module.css'

const SWATCHES = ['--color-primary', '--color-secondary', '--color-tertiary']

function App(): React.JSX.Element {
  return (
    <main className={styles.screen}>
      <h1 className={styles.title}>Hola</h1>
      <p className={styles.label}>Ilnamiki</p>
      <div className={styles.swatches}>
        {SWATCHES.map((token) => (
          <span
            key={token}
            className={styles.swatch}
            style={{ '--swatch-color': `var(${token})` } as CSSProperties}
          />
        ))}
      </div>
    </main>
  )
}

export default App
