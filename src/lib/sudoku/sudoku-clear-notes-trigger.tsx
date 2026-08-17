'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useSudokuContext } from './sudoku-context'

export interface SudokuClearNotesTriggerProps extends HTMLArkProps<'button'> {}

/** Clears every cell's notes and highlights grid-wide. */
export const SudokuClearNotesTrigger = forwardRef<HTMLButtonElement, SudokuClearNotesTriggerProps>((props, ref) => {
  const sudoku = useSudokuContext()
  const { children, ...restProps } = props
  const mergedProps = mergeProps(sudoku.getClearNotesTriggerProps(), restProps)
  return (
    <ark.button {...mergedProps} ref={ref}>
      {children ?? 'Clear notes'}
    </ark.button>
  )
})

SudokuClearNotesTrigger.displayName = 'Sudoku.ClearNotesTrigger'
