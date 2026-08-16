'use client'

import { normalizeProps, useMachine, type PropTypes } from '@zag-js/react'
import { machine } from './sudoku.machine'
import { connect } from './sudoku.connect'
import type { SudokuApi, SudokuProps } from './sudoku.types'

export interface UseSudokuProps extends SudokuProps {}
export interface UseSudokuReturn extends SudokuApi<PropTypes> {}

export function useSudoku(props: UseSudokuProps): UseSudokuReturn {
  const service = useMachine(machine, props)
  return connect(service, normalizeProps)
}
