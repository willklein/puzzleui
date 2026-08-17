'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useSudokuContext } from './sudoku-context'

export interface SudokuAutoNoteTriggerProps extends HTMLArkProps<'button'> {}

/** Snapshot-fills every empty, non-given cell's notes with its current remaining candidates. */
export const SudokuAutoNoteTrigger = forwardRef<HTMLButtonElement, SudokuAutoNoteTriggerProps>((props, ref) => {
  const sudoku = useSudokuContext()
  const { children, ...restProps } = props
  const mergedProps = mergeProps(sudoku.getAutoNoteTriggerProps(), restProps)
  return (
    <ark.button {...mergedProps} ref={ref}>
      {children ?? 'Auto-note'}
    </ark.button>
  )
})

SudokuAutoNoteTrigger.displayName = 'Sudoku.AutoNoteTrigger'
