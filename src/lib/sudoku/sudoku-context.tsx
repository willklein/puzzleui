'use client'

import { createContext, useContext } from 'react'
import type { UseSudokuReturn } from './use-sudoku'

const SudokuContext = createContext<UseSudokuReturn | null>(null)

export const SudokuProvider = SudokuContext.Provider

export function useSudokuContext(): UseSudokuReturn {
  const api = useContext(SudokuContext)
  if (!api) {
    throw new Error('useSudokuContext must be used within a <Sudoku.Root>')
  }
  return api
}
