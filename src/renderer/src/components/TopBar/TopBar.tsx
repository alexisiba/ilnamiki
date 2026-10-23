import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ShoulderHint } from './components/ShoulderHint'
import { TopBarBrand } from './components/TopBarBrand'
import { TopBarStatus } from './components/TopBarStatus'
import { TopBarTab } from './components/TopBarTab'
import { TOP_BAR_TABS } from './TopBar.constants'
import type { TopBarProps, TopBarTabId } from './TopBar.types'
import styles from './TopBar.module.css'

export function TopBar({ defaultTab }: TopBarProps): React.JSX.Element {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TopBarTabId>(defaultTab)

  const selectAdjacentTab = (offset: number): void => {
    const index = TOP_BAR_TABS.findIndex((tab) => tab.id === activeTab)
    const nextIndex = (index + offset + TOP_BAR_TABS.length) % TOP_BAR_TABS.length
    setActiveTab(TOP_BAR_TABS[nextIndex].id)
  }

  return (
    <header className={styles.topBar}>
      <TopBarBrand />
      <div className={styles.navigation}>
        <ShoulderHint action="prevSection" onPress={() => selectAdjacentTab(-1)} />
        <nav className={styles.tabs}>
          {TOP_BAR_TABS.map((tab) => (
            <TopBarTab
              key={tab.id}
              label={t(tab.labelKey)}
              active={tab.id === activeTab}
              onSelect={() => setActiveTab(tab.id)}
            />
          ))}
        </nav>
        <ShoulderHint action="nextSection" onPress={() => selectAdjacentTab(1)} />
      </div>
      <TopBarStatus />
    </header>
  )
}
