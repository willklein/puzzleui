'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useSudokuContext } from './sudoku-context'

export interface SudokuEraseTriggerProps extends HTMLArkProps<'button'> {}

/** Clears the focused cell's value (or notes, if empty) — Backspace as a button. Disabled when there's nothing to erase. */
export const SudokuEraseTrigger = forwardRef<HTMLButtonElement, SudokuEraseTriggerProps>((props, ref) => {
  const sudoku = useSudokuContext()
  const { children, ...restProps } = props
  const mergedProps = mergeProps(sudoku.getEraseTriggerProps(), restProps)
  return (
    <ark.button {...mergedProps} ref={ref}>
      {children ?? 'Erase'}
    </ark.button>
  )
})

SudokuEraseTrigger.displayName = 'Sudoku.EraseTrigger'
