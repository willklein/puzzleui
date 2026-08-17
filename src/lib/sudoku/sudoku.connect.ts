import type { PropTypes } from '@zag-js/react'
import type { NormalizeProps } from '@zag-js/types'
import type { SudokuApi, SudokuHighlightKind, SudokuService } from './sudoku.types'
import { dataAttr } from '../shared/dom'

export function connect<T extends PropTypes>(service: SudokuService, normalize: NormalizeProps<T>): SudokuApi<T> {
  const { context, prop, computed, send } = service

  const layout = computed('layout')
  const values = context.get('values')
  const given = computed('given')
  const notes = context.get('notes')
  const highlights = context.get('highlights')
  const notesInitialized = context.get('notesInitialized')
  const activePairs = computed('activePairs')
  const eliminated = computed('eliminated')
  const remainingCandidates = computed('remainingCandidates')
  const singleCandidate = computed('singleCandidate')
  const conflicts = computed('conflicts')
  const complete = computed('complete')
  const solved = computed('solved')
  const disabled = !!prop('disabled')
  const focusedIndex = context.get('focusedIndex')
  const noteMode = context.get('noteMode')
  const highlightMode = context.get('highlightMode')
  const canUndo = computed('canUndo')
  const canRedo = computed('canRedo')
  const autoSolveOnClick = prop('autoSolveOnClick')

  return {
    layout,
    values,
    given,
    notes,
    highlights,
    notesInitialized,
    activePairs,
    eliminated,
    remainingCandidates,
    singleCandidate,
    conflicts,
    complete,
    solved,
    disabled,
    focusedIndex,
    noteMode,
    highlightMode,
    canUndo,
    canRedo,

    setValue(index, digit) {
      send({ type: 'CELL.SET_VALUE', index, digit })
    },
    toggleNote(index, digit) {
      send({ type: 'CELL.TOGGLE_NOTE', index, digit })
    },
    toggleNoteHighlight(index, digit) {
      send({ type: 'CELL.TOGGLE_NOTE_HIGHLIGHT', index, digit })
    },
    clearCellNotes(index) {
      send({ type: 'CELL.CLEAR_NOTES', index })
    },
    autoSolveCell(index) {
      send({ type: 'CELL.AUTO_SOLVE', index })
    },
    autoNote() {
      send({ type: 'GRID.AUTO_NOTE' })
    },
    clearAllNotes() {
      send({ type: 'GRID.CLEAR_NOTES' })
    },
    setNoteMode(enabled) {
      send({ type: 'NOTE_MODE.SET', enabled })
    },
    toggleNoteMode() {
      send({ type: 'NOTE_MODE.SET', enabled: !noteMode })
    },
    setHighlightMode(mode) {
      send({ type: 'HIGHLIGHT_MODE.SET', mode })
    },
    focusCell(index) {
      send({ type: 'CELL.FOCUS', index })
    },
    moveFocus(rowDelta, colDelta) {
      send({ type: 'CELL.MOVE_FOCUS', rowDelta, colDelta })
    },
    undo() {
      send({ type: 'HISTORY.UNDO' })
    },
    redo() {
      send({ type: 'HISTORY.REDO' })
    },

    getRootProps() {
      return normalize.element({
        'data-scope': 'sudoku',
        'data-part': 'root',
        'data-solved': dataAttr(solved),
        'data-complete': dataAttr(complete),
        'data-disabled': dataAttr(disabled),
      })
    },

    getGridProps() {
      return normalize.element({
        'data-scope': 'sudoku',
        'data-part': 'grid',
      })
    },

    getCellProps(index) {
      const row = Math.floor(index / layout.size)
      const col = index % layout.size
      const value = values[index]
      const isGiven = given[index]
      const focused = index === focusedIndex

      return normalize.button({
        type: 'button',
        'data-scope': 'sudoku',
        'data-part': 'cell',
        'data-index': index,
        'data-row': row,
        'data-col': col,
        'data-box': Math.floor(row / layout.boxHeight) * layout.boxesAcross + Math.floor(col / layout.boxWidth),
        'data-given': dataAttr(isGiven),
        'data-value': value ?? undefined,
        'data-focused': dataAttr(focused),
        'data-conflict': dataAttr(conflicts[index]),
        'data-box-border-right': dataAttr((col + 1) % layout.boxWidth === 0 && col !== layout.size - 1),
        'data-box-border-bottom': dataAttr((row + 1) % layout.boxHeight === 0 && row !== layout.size - 1),
        tabIndex: focused ? 0 : -1,
        disabled,
        'aria-label': isGiven
          ? `Row ${row + 1}, column ${col + 1}, given ${value}`
          : value != null
            ? `Row ${row + 1}, column ${col + 1}, ${value}`
            : `Row ${row + 1}, column ${col + 1}, empty`,
        onFocus() {
          if (disabled) return
          send({ type: 'CELL.FOCUS', index })
        },
        onClick() {
          if (disabled) return
          send({ type: 'CELL.FOCUS', index })
          if (autoSolveOnClick && !isGiven && value == null && singleCandidate[index] != null) {
            send({ type: 'CELL.AUTO_SOLVE', index })
          }
        },
        onKeyDown(event) {
          // stopPropagation on every handled key, not just preventDefault: preventDefault only
          // suppresses the browser's own default action for *this* element, but the event still
          // bubbles up the DOM past it. Cells are <button>s, not text inputs, so a host page's
          // (or Storybook manager's) own global keyboard shortcuts — which typically only exempt
          // input/textarea/contentEditable from bubbling — would otherwise still see these keys.
          switch (event.key) {
            case 'ArrowUp':
              event.preventDefault()
              event.stopPropagation()
              send({ type: 'CELL.MOVE_FOCUS', rowDelta: -1, colDelta: 0 })
              return
            case 'ArrowDown':
              event.preventDefault()
              event.stopPropagation()
              send({ type: 'CELL.MOVE_FOCUS', rowDelta: 1, colDelta: 0 })
              return
            case 'ArrowLeft':
              event.preventDefault()
              event.stopPropagation()
              send({ type: 'CELL.MOVE_FOCUS', rowDelta: 0, colDelta: -1 })
              return
            case 'ArrowRight':
              event.preventDefault()
              event.stopPropagation()
              send({ type: 'CELL.MOVE_FOCUS', rowDelta: 0, colDelta: 1 })
              return
          }

          if (disabled || isGiven) return

          if (event.key === 'Backspace' || event.key === 'Delete') {
            event.preventDefault()
            event.stopPropagation()
            if (value != null) send({ type: 'CELL.SET_VALUE', index, digit: null })
            else send({ type: 'CELL.CLEAR_NOTES', index })
            return
          }

          const digit = Number(event.key)
          if (!Number.isInteger(digit) || digit < 1 || digit > layout.size) return
          event.preventDefault()
          event.stopPropagation()

          if (!noteMode) {
            send({ type: 'CELL.SET_VALUE', index, digit })
          } else if (event.shiftKey) {
            send({ type: 'CELL.TOGGLE_NOTE_HIGHLIGHT', index, digit })
          } else {
            send({ type: 'CELL.TOGGLE_NOTE', index, digit })
          }
        },
      })
    },

    getNoteProps(index, digit) {
      const hasNote = notes[index].includes(digit)
      const highlightKind: SudokuHighlightKind | undefined = highlights[index][digit]
      const isEliminated = hasNote && eliminated[index].includes(digit)

      return normalize.element({
        'data-scope': 'sudoku',
        'data-part': 'note',
        'data-digit': digit,
        'data-visible': dataAttr(hasNote),
        'data-highlighted': highlightKind,
        'data-eliminated': dataAttr(isEliminated),
      })
    },

    getSolvedIndicatorProps() {
      return normalize.element({
        'data-scope': 'sudoku',
        'data-part': 'solved-indicator',
        'data-solved': dataAttr(solved),
      })
    },

    getToolbarProps() {
      return normalize.element({
        'data-scope': 'sudoku',
        'data-part': 'toolbar',
      })
    },

    getNoteModeToggleProps() {
      return normalize.button({
        type: 'button',
        'data-scope': 'sudoku',
        'data-part': 'note-mode-toggle',
        'data-active': dataAttr(noteMode),
        'aria-pressed': noteMode,
        disabled,
        onClick() {
          if (disabled) return
          send({ type: 'NOTE_MODE.SET', enabled: !noteMode })
        },
      })
    },

    getHighlightModeToggleProps(mode) {
      const active = highlightMode === mode
      return normalize.button({
        type: 'button',
        'data-scope': 'sudoku',
        'data-part': 'highlight-mode-toggle',
        'data-mode': mode,
        'data-active': dataAttr(active),
        'aria-pressed': active,
        disabled,
        onClick() {
          if (disabled) return
          send({ type: 'HIGHLIGHT_MODE.SET', mode })
        },
      })
    },

    getAutoNoteTriggerProps() {
      return normalize.button({
        type: 'button',
        'data-scope': 'sudoku',
        'data-part': 'auto-note-trigger',
        disabled,
        onClick() {
          if (disabled) return
          send({ type: 'GRID.AUTO_NOTE' })
        },
      })
    },

    getClearNotesTriggerProps() {
      return normalize.button({
        type: 'button',
        'data-scope': 'sudoku',
        'data-part': 'clear-notes-trigger',
        disabled,
        onClick() {
          if (disabled) return
          send({ type: 'GRID.CLEAR_NOTES' })
        },
      })
    },

    getUndoTriggerProps() {
      return normalize.button({
        type: 'button',
        'data-scope': 'sudoku',
        'data-part': 'undo-trigger',
        disabled: disabled || !canUndo,
        onClick() {
          send({ type: 'HISTORY.UNDO' })
        },
      })
    },

    getRedoTriggerProps() {
      return normalize.button({
        type: 'button',
        'data-scope': 'sudoku',
        'data-part': 'redo-trigger',
        disabled: disabled || !canRedo,
        onClick() {
          send({ type: 'HISTORY.REDO' })
        },
      })
    },
  }
}
