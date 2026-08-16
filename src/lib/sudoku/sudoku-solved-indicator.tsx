'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useSudokuContext } from './sudoku-context'

export interface SudokuSolvedIndicatorProps extends HTMLArkProps<'div'> {
  /** Content to render while the puzzle is not yet solved. */
  fallback?: React.ReactNode | undefined
}

export const SudokuSolvedIndicator = forwardRef<HTMLDivElement, SudokuSolvedIndicatorProps>((props, ref) => {
  const sudoku = useSudokuContext()
  const { children, fallback, ...restProps } = props
  const mergedProps = mergeProps(sudoku.getSolvedIndicatorProps(), restProps)
  return (
    <ark.div {...mergedProps} ref={ref}>
      {sudoku.solved ? children : fallback}
    </ark.div>
  )
})

SudokuSolvedIndicator.displayName = 'Sudoku.SolvedIndicator'
