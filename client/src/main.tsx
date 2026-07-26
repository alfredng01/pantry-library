import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import { HeadlessMantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HeadlessMantineProvider>
      <Notifications position="top-right" />
      <App />
    </HeadlessMantineProvider>
  </StrictMode>,
)
