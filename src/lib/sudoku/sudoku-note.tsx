'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useSudokuContext } from './sudoku-context'

export interface SudokuNoteProps extends HTMLArkProps<'span'> {
  index: number
  digit: number
}

/** One candidate-digit slot within a cell's note grid. Purely display — notes are toggled via the cell's own keyboard handling. */
export const SudokuNote = forwardRef<HTMLSpanElement, SudokuNoteProps>(({ index, digit, children, ...props }, ref) => {
  const sudoku = useSudokuContext()
  const mergedProps = mergeProps(sudoku.getNoteProps(index, digit), props)

  return (
    <ark.span {...mergedProps} ref={ref}>
      {children ?? digit}
    </ark.span>
  )
})

SudokuNote.displayName = 'Sudoku.Note'
