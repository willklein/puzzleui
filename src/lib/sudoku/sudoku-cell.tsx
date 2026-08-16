'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useSudokuContext } from './sudoku-context'
import { SudokuNote } from './sudoku-note'

export interface SudokuCellProps extends HTMLArkProps<'button'> {
  /** Which cell this renders, flat-indexed `row * size + col`. */
  index: number
}

/** One grid cell: shows its committed digit if filled, otherwise a mini grid of candidate notes. */
export const SudokuCell = forwardRef<HTMLButtonElement, SudokuCellProps>(({ index, style, ...props }, ref) => {
  const sudoku = useSudokuContext()
  const mergedProps = mergeProps(sudoku.getCellProps(index), props)
  const value = sudoku.values[index]
  const noteColumns = Math.ceil(Math.sqrt(sudoku.layout.size))
  const cellStyle = { ...style, '--sudoku-note-columns': noteColumns } as React.CSSProperties

  return (
    <ark.button {...mergedProps} style={cellStyle} ref={ref}>
      {value != null
        ? value
        : Array.from({ length: sudoku.layout.size }, (_, i) => <SudokuNote key={i + 1} index={index} digit={i + 1} />)}
    </ark.button>
  )
})

SudokuCell.displayName = 'Sudoku.Cell'
