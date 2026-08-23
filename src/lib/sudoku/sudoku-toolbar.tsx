'use client'

import { forwardRef } from 'react'
import { mergeProps } from '@zag-js/react'
import { ark } from '@ark-ui/react/factory'
import type { HTMLArkProps } from '@ark-ui/react/factory'
import { useSudokuContext } from './sudoku-context'
import { SudokuNoteModeToggle } from './sudoku-note-mode-toggle'
import { SudokuHighlightModeToggle } from './sudoku-highlight-mode-toggle'
import { SudokuAutoNoteTrigger } from './sudoku-auto-note-trigger'
import { SudokuClearNotesTrigger } from './sudoku-clear-notes-trigger'
import { SudokuEraseTrigger } from './sudoku-erase-trigger'
import { SudokuUndoTrigger } from './sudoku-undo-trigger'
import { SudokuRedoTrigger } from './sudoku-redo-trigger'

export interface SudokuToolbarProps extends HTMLArkProps<'div'> {}

/**
 * A ready-made control strip: notes-mode toggle, box/row/column highlight-mode buttons,
 * auto-note, clear-notes, erase, and undo/redo — each also individually exported
 * (`Sudoku.NoteModeToggle`, `Sudoku.HighlightModeToggle`, etc.) for consumers who want a custom
 * layout or subset instead.
 */
export const SudokuToolbar = forwardRef<HTMLDivElement, SudokuToolbarProps>((props, ref) => {
  const sudoku = useSudokuContext()
  const mergedProps = mergeProps(sudoku.getToolbarProps(), props)
  return (
    <ark.div {...mergedProps} ref={ref}>
      <SudokuNoteModeToggle />
      <SudokuHighlightModeToggle mode="box" />
      <SudokuHighlightModeToggle mode="row" />
      <SudokuHighlightModeToggle mode="col" />
      <SudokuAutoNoteTrigger />
      <SudokuClearNotesTrigger />
      <SudokuEraseTrigger />
      <SudokuUndoTrigger />
      <SudokuRedoTrigger />
    </ark.div>
  )
})

SudokuToolbar.displayName = 'Sudoku.Toolbar'
