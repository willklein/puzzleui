'use client'

import { forwardRef, useEffect, useRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useSudokuContext } from './sudoku-context'
import { SudokuNote } from './sudoku-note'
import { mergeRefs } from '../shared/refs'

export interface SudokuCellProps extends HTMLArkProps<'button'> {
  /** Which cell this renders, flat-indexed `row * size + col`. */
  index: number
}

/** One grid cell: shows its committed digit if filled, otherwise a mini grid of candidate notes. */
export const SudokuCell = forwardRef<HTMLButtonElement, SudokuCellProps>(({ index, style, ...props }, ref) => {
  const sudoku = useSudokuContext()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const mergedProps = mergeProps(sudoku.getCellProps(index), props)
  const value = sudoku.values[index]
  const noteColumns = Math.ceil(Math.sqrt(sudoku.layout.size))
  const cellStyle = { ...style, '--sudoku-note-columns': noteColumns } as React.CSSProperties

  // Roving tabindex only controls *tab order* — arrow-key navigation moves `focusedIndex`
  // in the machine, but actual DOM focus has to be moved to match it explicitly, same as
  // Cryptex.Wheel does for its own roving-tabindex reel.
  useEffect(() => {
    if (sudoku.focusedIndex === index && document.activeElement !== buttonRef.current) {
      buttonRef.current?.focus()
    }
  }, [sudoku.focusedIndex, index])

  return (
    <ark.button {...mergedProps} style={cellStyle} ref={mergeRefs(ref, buttonRef)}>
      {value != null
        ? value
        : Array.from({ length: sudoku.layout.size }, (_, i) => <SudokuNote key={i + 1} index={index} digit={i + 1} />)}
    </ark.button>
  )
})

SudokuCell.displayName = 'Sudoku.Cell'
