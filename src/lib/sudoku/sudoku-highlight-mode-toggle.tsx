'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useSudokuContext } from './sudoku-context'
import type { SudokuHighlightKind } from './sudoku.types'

export interface SudokuHighlightModeToggleProps extends HTMLArkProps<'button'> {
  /** Which highlight kind this button selects. */
  mode: SudokuHighlightKind
}

const DEFAULT_LABEL: Record<SudokuHighlightKind, string> = {
  box: 'Box pairs',
  row: 'Row pairs',
  col: 'Column pairs',
}

/** Sets `highlightMode` to `mode` when clicked — one instance per kind (box/row/col). */
export const SudokuHighlightModeToggle = forwardRef<HTMLButtonElement, SudokuHighlightModeToggleProps>(
  ({ mode, children, ...props }, ref) => {
    const sudoku = useSudokuContext()
    const mergedProps = mergeProps(sudoku.getHighlightModeToggleProps(mode), props)
    return (
      <ark.button {...mergedProps} ref={ref}>
        {children ?? DEFAULT_LABEL[mode]}
      </ark.button>
    )
  },
)

SudokuHighlightModeToggle.displayName = 'Sudoku.HighlightModeToggle'
