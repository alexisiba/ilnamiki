import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'

import { useInputAction } from '@renderer/core/input'

import { ShoulderHint } from './components/ShoulderHint'
import { TopBarBrand } from './components/TopBarBrand'
import { TopBarStatus } from './components/TopBarStatus'
import { TopBarTab } from './components/TopBarTab'
import { TOP_BAR_TABS } from './TopBar.constants'
import styles from './TopBar.module.css'

export function TopBar(): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const selectAdjacentTab = (offset: number): void => {
    const index = TOP_BAR_TABS.findIndex((tab) => tab.path === pathname)
    const nextIndex = (index + offset + TOP_BAR_TABS.length) % TOP_BAR_TABS.length
    navigate(TOP_BAR_TABS[nextIndex].path, { replace: true })
  }

  useInputAction((action) => {
    if (action === 'prevSection') selectAdjacentTab(-1)
    if (action === 'nextSection') selectAdjacentTab(1)
  })

  return (
    <header className={styles.topBar}>
      <TopBarBrand />
      <div className={styles.navigation}>
        <ShoulderHint action="prevSection" onPress={() => selectAdjacentTab(-1)} />
        <nav className={styles.tabs}>
          {TOP_BAR_TABS.map((tab) => (
            <TopBarTab key={tab.id} label={t(tab.labelKey)} path={tab.path} />
          ))}
        </nav>
        <ShoulderHint action="nextSection" onPress={() => selectAdjacentTab(1)} />
      </div>
      <TopBarStatus />
    </header>
  )
}
