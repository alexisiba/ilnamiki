import { render, type RenderResult } from '@testing-library/react'

import { NavigationProvider } from '@renderer/core/navigation'

/** Renders `ui` inside the app's navigation, so focusable elements work as in the app. */
export function renderWithNavigation(ui: React.ReactNode): RenderResult {
  return render(<NavigationProvider>{ui}</NavigationProvider>)
}
