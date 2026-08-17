import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { BluePrincePage } from './pages/blue-prince-page'
import { SudokuPage } from './pages/sudoku-page'
import './styles/globals.css'

// No router library yet — just a few static routes. `/blue-prince` and `/sudoku` are
// intentionally not linked from the main page; visit them directly. Compare against
// BASE_URL so these still resolve correctly if the site is ever served from a subpath again.
const path = window.location.pathname.replace(/\/$/, '')
const resolvePath = (route: string) => `${import.meta.env.BASE_URL}${route}`.replace(/\/+/g, '/').replace(/\/$/, '')
const bluePrincePath = resolvePath('blue-prince')
const sudokuPath = resolvePath('sudoku')
const page = path === bluePrincePath ? <BluePrincePage /> : path === sudokuPath ? <SudokuPage /> : <App />

createRoot(document.getElementById('root')!).render(<StrictMode>{page}</StrictMode>)
