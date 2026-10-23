import './theme/globals.css'
import './core/i18n'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { APP_ROUTES } from './App.routes'

const router = createMemoryRouter(APP_ROUTES)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
