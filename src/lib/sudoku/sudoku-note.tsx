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

/**
 * One candidate-digit slot within a cell's note grid. Purely display — notes are toggled via
 * the cell's own keyboard handling. Anchored to a fixed row/column in the sub-grid by `digit`
 * (row-major, matching the same `--sudoku-note-columns` count `Sudoku.Cell` sizes the grid to)
 * so a digit always renders in the same spot (1 top-left, 2 top-center, ... for a 9-digit
 * puzzle) regardless of which other digits are currently noted — CSS Grid auto-placement would
 * otherwise compact the visible notes into the earliest slots as hidden ones drop out.
 */
export const SudokuNote = forwardRef<HTMLSpanElement, SudokuNoteProps>(
  ({ index, digit, children, style, ...props }, ref) => {
    const sudoku = useSudokuContext()
    const mergedProps = mergeProps(sudoku.getNoteProps(index, digit), props)
    const columns = Math.ceil(Math.sqrt(sudoku.layout.size))
    const noteStyle = {
      ...style,
      gridRow: Math.floor((digit - 1) / columns) + 1,
      gridColumn: ((digit - 1) % columns) + 1,
    } as React.CSSProperties

    return (
      <ark.span {...mergedProps} style={noteStyle} ref={ref}>
        {children ?? digit}
      </ark.span>
    )
  },
)

SudokuNote.displayName = 'Sudoku.Note'
