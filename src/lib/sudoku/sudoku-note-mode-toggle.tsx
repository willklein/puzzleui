'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useSudokuContext } from './sudoku-context'

export interface SudokuNoteModeToggleProps extends HTMLArkProps<'button'> {}

/** Toggles `noteMode`: off, digit keys set a cell's value; on, they toggle a note instead. */
export const SudokuNoteModeToggle = forwardRef<HTMLButtonElement, SudokuNoteModeToggleProps>((props, ref) => {
  const sudoku = useSudokuContext()
  const { children, ...restProps } = props
  const mergedProps = mergeProps(sudoku.getNoteModeToggleProps(), restProps)
  return (
    <ark.button {...mergedProps} ref={ref}>
      {children ?? `Notes ${sudoku.noteMode ? 'On' : 'Off'}`}
    </ark.button>
  )
})

SudokuNoteModeToggle.displayName = 'Sudoku.NoteModeToggle'
