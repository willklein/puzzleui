import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { BluePrincePage } from './pages/blue-prince-page'
import './styles/globals.css'

// No router library yet — just two static routes. `/blue-prince` is intentionally
// not linked from the main page; visit it directly. Compare against BASE_URL so
// this still resolves correctly if the site is ever served from a subpath again.
const path = window.location.pathname.replace(/\/$/, '')
const bluePrincePath = `${import.meta.env.BASE_URL}blue-prince`.replace(/\/+/g, '/').replace(/\/$/, '')
const page = path === bluePrincePath ? <BluePrincePage /> : <App />

createRoot(document.getElementById('root')!).render(<StrictMode>{page}</StrictMode>)
