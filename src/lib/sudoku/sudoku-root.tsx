'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useSudoku, type UseSudokuProps, type UseSudokuReturn } from './use-sudoku'
import { SudokuProvider } from './sudoku-context'
import { SudokuGrid } from './sudoku-grid'
import type { Assign } from '../shared/types'

export interface SudokuRootProps extends Omit<Assign<HTMLArkProps<'div'>, UseSudokuProps>, 'givens'> {
  /** `givens` is only required when building state internally — unneeded (and ignored) alongside `model`. */
  givens?: UseSudokuProps['givens'] | undefined
  /** A pre-built `useSudoku()` instance to use instead of constructing one from the other props, which are then ignored. Lets state be read/driven from outside this subtree, or shared across multiple places in a page. */
  model?: UseSudokuReturn | undefined
  /** Whether to auto-render `Sudoku.Grid`. Set to `false` to supply your own cell rendering via `children` instead. @default true */
  renderGrid?: boolean | undefined
}

export const SudokuRoot = forwardRef<HTMLDivElement, SudokuRootProps>((props, ref) => {
  const {
    model,
    renderGrid = true,
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
    shouldSetValue,
    onSetValue,
    shouldToggleNote,
    onToggleNote,
    shouldToggleNoteHighlight,
    onToggleNoteHighlight,
    shouldClearCellNotes,
    onClearCellNotes,
    shouldAutoSolveCell,
    onAutoSolveCell,
    shouldAutoNote,
    onAutoNote,
    shouldClearAllNotes,
    onClearAllNotes,
    shouldSetHighlightMode,
    onSetHighlightMode,
    shouldSetNoteMode,
    onSetNoteMode,
    shouldUndo,
    onUndo,
    shouldRedo,
    onRedo,
    children,
    ...localProps
  } = props

  // Called unconditionally, even when `model` is supplied, to satisfy React's rules of hooks —
  // `model ?? internalSudoku` (not `model || useSudoku(...)`) is what makes that safe.
  const internalSudoku = useSudoku({
    layout,
    givens: givens ?? [],
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
    shouldSetValue,
    onSetValue,
    shouldToggleNote,
    onToggleNote,
    shouldToggleNoteHighlight,
    onToggleNoteHighlight,
    shouldClearCellNotes,
    onClearCellNotes,
    shouldAutoSolveCell,
    onAutoSolveCell,
    shouldAutoNote,
    onAutoNote,
    shouldClearAllNotes,
    onClearAllNotes,
    shouldSetHighlightMode,
    onSetHighlightMode,
    shouldSetNoteMode,
    onSetNoteMode,
    shouldUndo,
    onUndo,
    shouldRedo,
    onRedo,
  })
  const sudoku = model ?? internalSudoku
  const mergedProps = mergeProps(sudoku.getRootProps(), localProps)

  return (
    <SudokuProvider value={sudoku}>
      <ark.div {...mergedProps} ref={ref}>
        {renderGrid && <SudokuGrid />}
        {children}
      </ark.div>
    </SudokuProvider>
  )
})

SudokuRoot.displayName = 'Sudoku.Root'
