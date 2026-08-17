'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useSudokuContext } from './sudoku-context'

export interface SudokuUndoTriggerProps extends HTMLArkProps<'button'> {}

/** Undoes the most recent action. Disabled when `canUndo` is false. */
export const SudokuUndoTrigger = forwardRef<HTMLButtonElement, SudokuUndoTriggerProps>((props, ref) => {
  const sudoku = useSudokuContext()
  const { children, ...restProps } = props
  const mergedProps = mergeProps(sudoku.getUndoTriggerProps(), restProps)
  return (
    <ark.button {...mergedProps} ref={ref}>
      {children ?? 'Undo'}
    </ark.button>
  )
})

SudokuUndoTrigger.displayName = 'Sudoku.UndoTrigger'
