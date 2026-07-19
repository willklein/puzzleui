import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { BluePrincePage } from './pages/blue-prince-page'
import './styles/globals.css'

// No router library yet — just two static routes. `/blue-prince` is intentionally
// not linked from the main page; visit it directly.
const page = window.location.pathname === '/blue-prince' ? <BluePrincePage /> : <App />

createRoot(document.getElementById('root')!).render(<StrictMode>{page}</StrictMode>)
