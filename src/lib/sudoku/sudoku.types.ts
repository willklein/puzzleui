import type { EventObject, Machine, Service } from '@zag-js/core'
import type { PropTypes } from '@zag-js/react'

export interface SudokuLayout {
  /** The grid's width/height in cells (also the number of distinct digits, `1..size`). */
  size: number
  /** A box's width in cells. Must evenly divide `size` together with `boxHeight` (`boxWidth * boxHeight === size`). */
  boxWidth: number
  /** A box's height in cells. */
  boxHeight: number
}

export interface ResolvedSudokuLayout extends SudokuLayout {
  /** How many boxes sit side by side horizontally (`size / boxWidth`). */
  boxesAcross: number
  /** How many boxes are stacked vertically (`size / boxHeight`). */
  boxesDown: number
}

export const SUDOKU_9X9: SudokuLayout = { size: 9, boxWidth: 3, boxHeight: 3 }
export const SUDOKU_6X6: SudokuLayout = { size: 6, boxWidth: 3, boxHeight: 2 }
export const SUDOKU_4X4: SudokuLayout = { size: 4, boxWidth: 2, boxHeight: 2 }

/** Which kind of unit a note's pair-highlight claims share exactly two candidate cells. */
export type SudokuHighlightKind = 'box' | 'row' | 'col'

/** Two cells in the same unit that are the only remaining candidates for `digit`, per the player's own highlight marks. */
export interface SudokuActivePair {
  kind: SudokuHighlightKind
  unitIndex: number
  digit: number
  cells: [number, number]
}

/** A cell's notes/highlights/notesInitialized as they stood immediately before a value was committed into it, so clearing the value can restore them. */
export interface SudokuHiddenCell {
  notes: number[]
  highlights: Record<number, SudokuHighlightKind>
  notesInitialized: boolean
}

/** The 7 fields tracked by undo/redo history. `focusedIndex` is deliberately excluded so undo never moves the cursor. */
export interface SudokuHistorySnapshot {
  values: Array<number | null>
  notes: number[][]
  highlights: Array<Record<number, SudokuHighlightKind>>
  /** Per cell, whether its notes were last (re)established via `autoNote()` — see `SudokuSchema.context.notesInitialized`. */
  notesInitialized: boolean[]
  /** Per cell, the pre-commit notes to restore if/when its value is cleared — see `SudokuSchema.context.hiddenCells`. */
  hiddenCells: Array<SudokuHiddenCell | null>
  noteMode: boolean
  highlightMode: SudokuHighlightKind
}

export interface SudokuProps {
  /** The grid's shape. @default SUDOKU_9X9 */
  layout?: SudokuLayout | undefined
  /** The puzzle's fixed clues, flat-indexed `row * size + col`. `null` marks an empty, player-fillable cell. Length must equal `size * size`. */
  givens: Array<number | null>
  /** The controlled committed digit per cell (given + player-entered). */
  value?: Array<number | null> | undefined
  /** The initial per-cell values when uncontrolled, merged with `givens`. */
  defaultValue?: Array<number | null> | undefined
  /** The controlled per-cell candidate notes. */
  notes?: number[][] | undefined
  /** The initial per-cell candidate notes when uncontrolled. */
  defaultNotes?: number[][] | undefined
  /** The controlled per-cell note highlights. */
  highlights?: Array<Record<number, SudokuHighlightKind>> | undefined
  /** The initial per-cell note highlights when uncontrolled. */
  defaultHighlights?: Array<Record<number, SudokuHighlightKind>> | undefined
  /** The controlled notes-mode toggle: off, digit keys set a cell's value; on, they toggle a note instead. */
  noteMode?: boolean | undefined
  /** The initial notes-mode when uncontrolled. @default false */
  defaultNoteMode?: boolean | undefined
  /** The controlled highlight-mode toggle, governing what kind newly-marked highlights get. */
  highlightMode?: SudokuHighlightKind | undefined
  /** The initial highlight-mode when uncontrolled. @default 'box' */
  defaultHighlightMode?: SudokuHighlightKind | undefined
  /** Whether clicking a cell with exactly one remaining candidate immediately commits it. @default true */
  autoSolveOnClick?: boolean | undefined
  /** An optional known-correct grid to validate against, for parity with Cryptex/Acrostic. Not required — `solved` otherwise self-verifies via the standard Sudoku rules. */
  solution?: Array<number | null> | undefined
  /** Maximum undo/redo stack depth. @default 200 */
  maxHistoryLength?: number | undefined
  disabled?: boolean | undefined
  id?: string | undefined
  onValueChange?: ((value: Array<number | null>) => void) | undefined
  onNotesChange?: ((notes: number[][]) => void) | undefined
  onHighlightsChange?: ((highlights: Array<Record<number, SudokuHighlightKind>>) => void) | undefined
  onNoteModeChange?: ((noteMode: boolean) => void) | undefined
  onHighlightModeChange?: ((highlightMode: SudokuHighlightKind) => void) | undefined
  onSolvedChange?: ((solved: boolean) => void) | undefined
}

export interface SudokuSchema {
  state: 'idle'
  props: SudokuProps & { layout: SudokuLayout; maxHistoryLength: number }
  context: {
    values: Array<number | null>
    notes: number[][]
    highlights: Array<Record<number, SudokuHighlightKind>>
    /**
     * Per cell, whether its notes were last (re)established via `autoNote()` — the gate
     * `singleCandidate` requires before treating a cell as auto-solvable, so the player must
     * have explicitly seen (and, via elimination, narrowed) the candidates rather than the
     * assist inferring a value purely from live constraint math. Reset to `false` for a cell
     * whenever its notes are cleared (individually or grid-wide).
     */
    notesInitialized: boolean[]
    /**
     * Per cell, the notes/highlights/notesInitialized it had immediately before a value was
     * last committed into it (or `null` if none stashed / already restored). `setValue`
     * writes this when committing a digit and reads it back when clearing one, so Backspace
     * on a valued cell deterministically restores that cell's own prior notes — independent
     * of what else has happened in the undo/redo history since.
     */
    hiddenCells: Array<SudokuHiddenCell | null>
    noteMode: boolean
    highlightMode: SudokuHighlightKind
    /** Roving-tabindex focused cell. */
    focusedIndex: number
  }
  refs: {
    past: SudokuHistorySnapshot[]
    future: SudokuHistorySnapshot[]
  }
  computed: {
    layout: ResolvedSudokuLayout
    /** Pure function of the `givens` prop — not context, to avoid redundant/driftable state. */
    given: boolean[]
    unitPlacedDigits: { rows: Set<number>[]; cols: Set<number>[]; boxes: Set<number>[] }
    activePairs: SudokuActivePair[]
    /** Per cell, digits ruled out by active pair propagation (independent of whether they're in `notes`). */
    eliminated: number[][]
    /** Per empty, non-given cell: digits not yet placed in its row/col/box and not eliminated. */
    remainingCandidates: number[][]
    /**
     * `remainingCandidates[cell]` collapsed to its one digit, or `null` — but only once
     * `notesInitialized[cell]` is true AND that digit is still present in `notes[cell]`.
     * A cell with a forced single candidate that the player never noted (via `autoNote()`)
     * reports `null` here, not the digit — auto-solve requires the player to have seen it.
     */
    singleCandidate: Array<number | null>
    /** Cells currently violating row/col/box uniqueness. */
    conflicts: boolean[]
    complete: boolean
    solved: boolean
    canUndo: boolean
    canRedo: boolean
  }
  event: EventObject
  action: string
  guard: string
  effect: string
}

export type SudokuService = Service<SudokuSchema>
export type SudokuMachine = Machine<SudokuSchema>

export interface SudokuApi<T extends PropTypes = PropTypes> {
  layout: ResolvedSudokuLayout
  values: Array<number | null>
  given: boolean[]
  notes: number[][]
  highlights: Array<Record<number, SudokuHighlightKind>>
  /** Per cell, whether its notes were last (re)established via `autoNote()` — see `singleCandidate`. */
  notesInitialized: boolean[]
  /** Currently-confirmed box/row/col pairs, derived from `highlights`. */
  activePairs: SudokuActivePair[]
  eliminated: number[][]
  remainingCandidates: number[][]
  singleCandidate: Array<number | null>
  conflicts: boolean[]
  complete: boolean
  solved: boolean
  disabled: boolean
  focusedIndex: number
  noteMode: boolean
  highlightMode: SudokuHighlightKind
  canUndo: boolean
  canRedo: boolean

  /** Commits `digit` (or clears with `null`) into cell `index`. No-ops on a given cell. */
  setValue: (index: number, digit: number | null) => void
  /** Toggles a plain candidate note. No-ops on a given or already-valued cell. */
  toggleNote: (index: number, digit: number) => void
  /** Toggles/re-tags a note's highlight using the current `highlightMode` (creates the note if needed). */
  toggleNoteHighlight: (index: number, digit: number) => void
  /** Clears every note (and highlight) in one cell. */
  clearCellNotes: (index: number) => void
  /** Commits `singleCandidate[index]` if defined; no-op otherwise. */
  autoSolveCell: (index: number) => void
  /** Snapshot-fills every empty, non-given cell's notes with its current remaining candidates, preserving existing highlights. */
  autoNote: () => void
  /** Clears every cell's notes and highlights grid-wide. */
  clearAllNotes: () => void
  setNoteMode: (enabled: boolean) => void
  toggleNoteMode: () => void
  setHighlightMode: (mode: SudokuHighlightKind) => void
  focusCell: (index: number) => void
  /** Moves keyboard focus by `(rowDelta, colDelta)`, clamped at the grid edges. */
  moveFocus: (rowDelta: number, colDelta: number) => void
  undo: () => void
  redo: () => void

  getRootProps: () => T['element']
  getGridProps: () => T['element']
  getCellProps: (index: number) => T['button']
  getNoteProps: (index: number, digit: number) => T['element']
  getSolvedIndicatorProps: () => T['element']
  getUndoTriggerProps: () => T['button']
  getRedoTriggerProps: () => T['button']
}
