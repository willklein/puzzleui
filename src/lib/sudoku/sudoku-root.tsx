'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useSudoku, type UseSudokuProps } from './use-sudoku'
import { SudokuProvider } from './sudoku-context'
import { SudokuGrid } from './sudoku-grid'
import type { Assign } from '../shared/types'

export interface SudokuRootProps extends Assign<HTMLArkProps<'div'>, UseSudokuProps> {}

export const SudokuRoot = forwardRef<HTMLDivElement, SudokuRootProps>((props, ref) => {
  const {
    layout,
    givens,
    value,
    defaultValue,
    notes,
    defaultNotes,
    highlights,
    defaultHighlights,
    noteMode,
    defaultNoteMode,
    highlightMode,
    defaultHighlightMode,
    autoSolveOnClick,
    solution,
    maxHistoryLength,
    disabled,
    id,
    onValueChange,
    onNotesChange,
    onHighlightsChange,
    onNoteModeChange,
    onHighlightModeChange,
    onSolvedChange,
    children,
    ...localProps
  } = props

  const sudoku = useSudoku({
    layout,
    givens,
    value,
    defaultValue,
    notes,
    defaultNotes,
    highlights,
    defaultHighlights,
    noteMode,
    defaultNoteMode,
    highlightMode,
    defaultHighlightMode,
    autoSolveOnClick,
    solution,
    maxHistoryLength,
    disabled,
    id,
    onValueChange,
    onNotesChange,
    onHighlightsChange,
    onNoteModeChange,
    onHighlightModeChange,
    onSolvedChange,
  })
  const mergedProps = mergeProps(sudoku.getRootProps(), localProps)

  return (
    <SudokuProvider value={sudoku}>
      <ark.div {...mergedProps} ref={ref}>
        <SudokuGrid />
        {children}
      </ark.div>
    </SudokuProvider>
  )
})

SudokuRoot.displayName = 'Sudoku.Root'
