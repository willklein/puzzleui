'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useSudokuContext } from './sudoku-context'

export interface SudokuRedoTriggerProps extends HTMLArkProps<'button'> {}

/** Redoes the most recently undone action. Disabled when `canRedo` is false. */
export const SudokuRedoTrigger = forwardRef<HTMLButtonElement, SudokuRedoTriggerProps>((props, ref) => {
  const sudoku = useSudokuContext()
  const { children, ...restProps } = props
  const mergedProps = mergeProps(sudoku.getRedoTriggerProps(), restProps)
  return (
    <ark.button {...mergedProps} ref={ref}>
      {children ?? 'Redo'}
    </ark.button>
  )
})

SudokuRedoTrigger.displayName = 'Sudoku.RedoTrigger'
