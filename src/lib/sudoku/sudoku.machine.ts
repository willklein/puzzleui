import { createMachine } from '@zag-js/core'
import type { Params } from '@zag-js/core'
import {
  SUDOKU_9X9,
  type ResolvedSudokuLayout,
  type SudokuActivePair,
  type SudokuCallback,
  type SudokuGuard,
  type SudokuHiddenCell,
  type SudokuHighlightKind,
  type SudokuHistorySnapshot,
  type SudokuLayout,
  type SudokuSchema,
  type SudokuStateSnapshot,
} from './sudoku.types'

// ---------------------------------------------------------------------------
// Layout math
// ---------------------------------------------------------------------------

function resolveLayout(layout: SudokuLayout): ResolvedSudokuLayout {
  return {
    ...layout,
    boxesAcross: layout.size / layout.boxWidth,
    boxesDown: layout.size / layout.boxHeight,
  }
}

function rowOf(cell: number, size: number): number {
  return Math.floor(cell / size)
}

function colOf(cell: number, size: number): number {
  return cell % size
}

function boxOf(cell: number, layout: ResolvedSudokuLayout): number {
  const boxRow = Math.floor(rowOf(cell, layout.size) / layout.boxHeight)
  const boxCol = Math.floor(colOf(cell, layout.size) / layout.boxWidth)
  return boxRow * layout.boxesAcross + boxCol
}

function unitIndexOf(cell: number, kind: SudokuHighlightKind, layout: ResolvedSudokuLayout): number {
  switch (kind) {
    case 'row':
      return rowOf(cell, layout.size)
    case 'col':
      return colOf(cell, layout.size)
    case 'box':
      return boxOf(cell, layout)
  }
}

function cellsInUnit(kind: SudokuHighlightKind, unitIndex: number, layout: ResolvedSudokuLayout): number[] {
  const cells: number[] = []
  for (let cell = 0; cell < layout.size * layout.size; cell++) {
    if (unitIndexOf(cell, kind, layout) === unitIndex) cells.push(cell)
  }
  return cells
}

/** Every other cell sharing `cell`'s row, column, or box (never includes `cell` itself). */
function peerCellsOf(cell: number, layout: ResolvedSudokuLayout): Set<number> {
  const peers = new Set<number>()
  for (const kind of ['row', 'col', 'box'] as const) {
    for (const peer of cellsInUnit(kind, unitIndexOf(cell, kind, layout), layout)) {
      if (peer !== cell) peers.add(peer)
    }
  }
  return peers
}

// ---------------------------------------------------------------------------
// Fill / init + small array helpers
// ---------------------------------------------------------------------------

function withCell<T>(arr: T[], index: number, next: T): T[] {
  const out = arr.slice()
  out[index] = next
  return out
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max)
}

function arrayIsEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/** Given cells always win over whatever raw/default value was passed in for that cell. */
function fillValues(raw: Array<number | null> | undefined, givens: Array<number | null>): Array<number | null> {
  return givens.map((given, i) => given ?? raw?.[i] ?? null)
}

function fillNotes(raw: number[][] | undefined, size: number): number[][] {
  return Array.from({ length: size * size }, (_, i) => (raw?.[i] ? [...raw[i]].sort((a, b) => a - b) : []))
}

function fillHighlights(
  raw: Array<Record<number, SudokuHighlightKind>> | undefined,
  size: number,
): Array<Record<number, SudokuHighlightKind>> {
  return Array.from({ length: size * size }, (_, i) => ({ ...raw?.[i] }))
}

// ---------------------------------------------------------------------------
// Unit-placed-digit sets
// ---------------------------------------------------------------------------

interface UnitPlacedDigits {
  rows: Set<number>[]
  cols: Set<number>[]
  boxes: Set<number>[]
}

function getUnitPlacedDigits(values: Array<number | null>, layout: ResolvedSudokuLayout): UnitPlacedDigits {
  const rows = Array.from({ length: layout.size }, () => new Set<number>())
  const cols = Array.from({ length: layout.size }, () => new Set<number>())
  const boxes = Array.from({ length: layout.boxesAcross * layout.boxesDown }, () => new Set<number>())

  values.forEach((value, cell) => {
    if (value == null) return
    rows[rowOf(cell, layout.size)].add(value)
    cols[colOf(cell, layout.size)].add(value)
    boxes[boxOf(cell, layout)].add(value)
  })

  return { rows, cols, boxes }
}

// ---------------------------------------------------------------------------
// Pair + elimination engine
//
// A note highlighted in exactly 2 cells of the same unit is the player
// asserting "this digit can only be in one of these two cells" — the tool
// never verifies that premise, only propagates it:
//   1. primary-unit cleanup: no other cell in that same unit can hold the
//      digit either, since the player already claimed it's confined to
//      these two.
//   2. secondary-unit propagation: if the pair's two cells also happen to
//      share a *different* kind of unit (a box-pair sharing a row/column,
//      or a row/col-pair sharing a box), the digit is confined there too.
// ---------------------------------------------------------------------------

const SECONDARY_KINDS: Record<SudokuHighlightKind, SudokuHighlightKind[]> = {
  box: ['row', 'col'],
  row: ['box'],
  col: ['box'],
}

function getActivePairs(
  highlights: Array<Record<number, SudokuHighlightKind>>,
  layout: ResolvedSudokuLayout,
): SudokuActivePair[] {
  const groups = new Map<string, number[]>()

  highlights.forEach((cellHighlights, cell) => {
    for (const [digitKey, kind] of Object.entries(cellHighlights)) {
      const unitIndex = unitIndexOf(cell, kind, layout)
      const key = `${kind}:${unitIndex}:${digitKey}`
      const group = groups.get(key)
      if (group) group.push(cell)
      else groups.set(key, [cell])
    }
  })

  const pairs: SudokuActivePair[] = []
  for (const [key, cells] of groups) {
    if (cells.length !== 2) continue
    const [kind, unitIndexStr, digitStr] = key.split(':')
    pairs.push({
      kind: kind as SudokuHighlightKind,
      unitIndex: Number(unitIndexStr),
      digit: Number(digitStr),
      cells: [cells[0], cells[1]],
    })
  }
  return pairs
}

function getEliminated(activePairs: SudokuActivePair[], layout: ResolvedSudokuLayout): number[][] {
  const eliminated: Set<number>[] = Array.from({ length: layout.size * layout.size }, () => new Set<number>())

  for (const pair of activePairs) {
    const [a, b] = pair.cells
    const own = new Set(pair.cells)

    for (const cell of cellsInUnit(pair.kind, pair.unitIndex, layout)) {
      if (!own.has(cell)) eliminated[cell].add(pair.digit)
    }

    for (const secondaryKind of SECONDARY_KINDS[pair.kind]) {
      const unitIndexA = unitIndexOf(a, secondaryKind, layout)
      if (unitIndexA !== unitIndexOf(b, secondaryKind, layout)) continue
      for (const cell of cellsInUnit(secondaryKind, unitIndexA, layout)) {
        if (!own.has(cell)) eliminated[cell].add(pair.digit)
      }
    }
  }

  return eliminated.map((set) => Array.from(set).sort((x, y) => x - y))
}

// ---------------------------------------------------------------------------
// Candidate + conflict engines
// ---------------------------------------------------------------------------

function getRemainingCandidates(
  values: Array<number | null>,
  given: boolean[],
  unitPlacedDigits: UnitPlacedDigits,
  eliminated: number[][],
  layout: ResolvedSudokuLayout,
): number[][] {
  return values.map((value, cell) => {
    if (value != null || given[cell]) return []
    const row = rowOf(cell, layout.size)
    const col = colOf(cell, layout.size)
    const box = boxOf(cell, layout)
    const eliminatedSet = new Set(eliminated[cell])
    const candidates: number[] = []
    for (let digit = 1; digit <= layout.size; digit++) {
      if (unitPlacedDigits.rows[row].has(digit)) continue
      if (unitPlacedDigits.cols[col].has(digit)) continue
      if (unitPlacedDigits.boxes[box].has(digit)) continue
      if (eliminatedSet.has(digit)) continue
      candidates.push(digit)
    }
    return candidates
  })
}

/**
 * A cell is only auto-solvable once the player has explicitly seen its candidates via
 * `autoNote()` (`notesInitialized[cell]`) and, since then, elimination/note-toggling has
 * narrowed what's left to exactly one live candidate that's still present in `notes[cell]`.
 * This deliberately excludes cells the assist could solve purely from constraint math but
 * the player never actually noted — see requirement discussion in sudoku.types.ts.
 */
function getSingleCandidate(
  remainingCandidates: number[][],
  notes: number[][],
  notesInitialized: boolean[],
): Array<number | null> {
  return remainingCandidates.map((candidates, cell) => {
    if (candidates.length !== 1) return null
    if (!notesInitialized[cell]) return null
    return notes[cell].includes(candidates[0]) ? candidates[0] : null
  })
}

function getConflicts(values: Array<number | null>, layout: ResolvedSudokuLayout): boolean[] {
  const conflicts = new Array(values.length).fill(false)
  for (const kind of ['row', 'col', 'box'] as const) {
    const unitCount = kind === 'box' ? layout.boxesAcross * layout.boxesDown : layout.size
    for (let unitIndex = 0; unitIndex < unitCount; unitIndex++) {
      const seen = new Map<number, number[]>()
      for (const cell of cellsInUnit(kind, unitIndex, layout)) {
        const value = values[cell]
        if (value == null) continue
        const cells = seen.get(value)
        if (cells) cells.push(cell)
        else seen.set(value, [cell])
      }
      for (const cells of seen.values()) {
        if (cells.length > 1) for (const cell of cells) conflicts[cell] = true
      }
    }
  }
  return conflicts
}

/**
 * Per cell, which of its own notes are "scarce": within that cell's unit of `highlightMode`'s
 * kind (box/row/col), at most 2 cells total have that digit noted. This is a live count of
 * `notes` itself — unrelated to whether the player has manually marked a highlight pair — so it
 * updates automatically as notes are added/cleared by any means (toggling, `autoNote()`,
 * clearing, Backspace, ...). Scoped to the current `highlightMode` per requirement: box pairs
 * when 'box' is selected, row pairs when 'row', column pairs when 'col'.
 */
function getScarceNotes(
  notes: number[][],
  highlightMode: SudokuHighlightKind,
  layout: ResolvedSudokuLayout,
): number[][] {
  const unitCount = highlightMode === 'box' ? layout.boxesAcross * layout.boxesDown : layout.size
  const countsByUnit: Array<Map<number, number>> = Array.from({ length: unitCount }, () => new Map())

  notes.forEach((cellNotes, cell) => {
    const unitIndex = unitIndexOf(cell, highlightMode, layout)
    for (const digit of cellNotes) {
      countsByUnit[unitIndex].set(digit, (countsByUnit[unitIndex].get(digit) ?? 0) + 1)
    }
  })

  return notes.map((cellNotes, cell) => {
    const unitIndex = unitIndexOf(cell, highlightMode, layout)
    return cellNotes.filter((digit) => (countsByUnit[unitIndex].get(digit) ?? 0) <= 2)
  })
}

// ---------------------------------------------------------------------------
// History (undo/redo)
// ---------------------------------------------------------------------------

type CommitParams = Pick<Params<SudokuSchema>, 'context' | 'refs' | 'prop' | 'computed'>

function snapshot({ context }: Pick<CommitParams, 'context'>): SudokuHistorySnapshot {
  return {
    values: context.get('values'),
    notes: context.get('notes'),
    highlights: context.get('highlights'),
    notesInitialized: context.get('notesInitialized'),
    hiddenCells: context.get('hiddenCells'),
    noteMode: context.get('noteMode'),
    highlightMode: context.get('highlightMode'),
  }
}

function buildStateSnapshot({
  context,
  computed,
  prop,
}: Pick<Params<SudokuSchema>, 'context' | 'computed' | 'prop'>): SudokuStateSnapshot {
  return {
    layout: computed('layout'),
    values: context.get('values'),
    given: computed('given'),
    notes: context.get('notes'),
    highlights: context.get('highlights'),
    notesInitialized: context.get('notesInitialized'),
    activePairs: computed('activePairs'),
    eliminated: computed('eliminated'),
    scarceNotes: computed('scarceNotes'),
    remainingCandidates: computed('remainingCandidates'),
    singleCandidate: computed('singleCandidate'),
    conflicts: computed('conflicts'),
    complete: computed('complete'),
    solved: computed('solved'),
    disabled: !!prop('disabled'),
    focusedIndex: context.get('focusedIndex'),
    selectedIndices: context.get('selectedIndices'),
    noteMode: context.get('noteMode'),
    highlightMode: context.get('highlightMode'),
    canUndo: computed('canUndo'),
    canRedo: computed('canRedo'),
  }
}

interface CommitHooks<TData> {
  data: TData
  shouldCommit?: SudokuGuard<TData> | undefined
  onCommit?: SudokuCallback<TData> | undefined
}

/**
 * Pushes the pre-mutation state onto the undo stack, clears redo, then applies `updates` — but
 * only once `hooks.shouldCommit` (if given) has had a chance to veto by returning `false`.
 * `hooks.onCommit` then fires with the state as it stood immediately before this mutation.
 * `hooks` itself is optional: batch callers (see `resolveTargets`) that have already run their
 * own per-cell guard/callback checks before accumulating `updates` pass no hooks here at all.
 */
function commit<TData>(
  { context, refs, prop, computed }: CommitParams,
  updates: Partial<SudokuHistorySnapshot>,
  hooks?: CommitHooks<TData>,
) {
  const prevState = buildStateSnapshot({ context, computed, prop })
  if (hooks && hooks.shouldCommit?.({ data: hooks.data, state: prevState }) === false) return

  const past = [...refs.get('past'), snapshot({ context })]
  const max = prop('maxHistoryLength')
  refs.set('past', past.length > max ? past.slice(past.length - max) : past)
  refs.set('future', [])

  for (const key of Object.keys(updates) as Array<keyof SudokuHistorySnapshot>) {
    context.set(key, updates[key] as never)
  }

  if (hooks) hooks.onCommit?.({ data: hooks.data, prevState })
}

/**
 * Every cell-targeting cursor/entry event resolves its actual target set through here: when
 * `selectedIndices` holds an active multi-selection (length > 1) that includes the cell the
 * event was dispatched for, the whole selection is the target; otherwise it's just that one
 * cell — the ordinary, pre-multi-select behavior.
 */
function resolveTargets(selectedIndices: number[], eventIndex: number): number[] {
  return selectedIndices.length > 1 && selectedIndices.includes(eventIndex) ? selectedIndices : [eventIndex]
}

/**
 * Shared by `setCellValue`/`autoSolveCell`. Committing a digit stashes the cell's current
 * notes/highlights/notesInitialized into `hiddenCells[index]` (so clearing it later restores
 * them, independent of anything else that happens in between) and, per requirement #5, clears
 * `digit` from every peer's notes/highlights. Clearing (`digit === null`) restores from that
 * stash instead of just blanking the cell — this is what makes Backspace on a valued cell a
 * deterministic "clear and restore this cell" action rather than a walk through global undo.
 *
 * `indices` may target more than one cell at once (an active multi-selection): every cell that
 * passes `hooks.shouldCommit` lands in a single shared `commit()` call — one history entry for
 * the whole batch — with `hooks.onCommit` then firing once per cell that actually committed.
 */
function commitValue<TData>(
  { context, refs, prop, computed }: CommitParams,
  indices: number[],
  digit: number | null,
  hooks: {
    data: (index: number) => TData
    shouldCommit?: SudokuGuard<TData> | undefined
    onCommit?: SudokuCallback<TData> | undefined
  },
) {
  const prevState = buildStateSnapshot({ context, computed, prop })
  const layout = computed('layout')

  let values = context.get('values')
  let notes = context.get('notes')
  let highlights = context.get('highlights')
  let notesInitialized = context.get('notesInitialized')
  let hiddenCells = context.get('hiddenCells')
  const committed: number[] = []

  for (const index of indices) {
    if (values[index] === digit) {
      // Already at the target value. For a Backspace-style clear (digit === null) on a cell
      // that's already empty but still carries residual notes/highlights (e.g. one cell in a
      // multi-selection with a mix of valued and empty-with-notes cells), clear those too —
      // folded into this same pass, and this same commit, rather than a second dispatched
      // event: a later `send()` in the same synchronous batch can't see an earlier one's
      // `context.set()` here (Zag's React-backed bindable context isn't read-your-own-writes
      // across separate actions within one tick), so two sequential commits would have the
      // second silently clobber the first's changes with its own stale pre-mutation snapshot.
      if (digit == null && (notes[index].length > 0 || Object.keys(highlights[index]).length > 0)) {
        if (hooks.shouldCommit?.({ data: hooks.data(index), state: prevState }) === false) continue
        notes = withCell(notes, index, [])
        highlights = withCell(highlights, index, {})
        notesInitialized = withCell(notesInitialized, index, false)
        committed.push(index)
      }
      continue
    }
    if (hooks.shouldCommit?.({ data: hooks.data(index), state: prevState }) === false) continue

    values = withCell(values, index, digit)

    if (digit != null) {
      hiddenCells = withCell(hiddenCells, index, {
        notes: notes[index],
        highlights: highlights[index],
        notesInitialized: notesInitialized[index],
      })
      notes = withCell(notes, index, [])
      highlights = withCell(highlights, index, {})
      notesInitialized = withCell(notesInitialized, index, false)

      const peers = peerCellsOf(index, layout)
      notes = notes.map((cellNotes, i) => (peers.has(i) ? cellNotes.filter((d) => d !== digit) : cellNotes))
      highlights = highlights.map((cellHighlights, i) => {
        if (!peers.has(i) || !(digit in cellHighlights)) return cellHighlights
        const { [digit]: _removed, ...rest } = cellHighlights
        return rest
      })
    } else {
      const hidden = hiddenCells[index]
      notes = withCell(notes, index, hidden?.notes ?? [])
      highlights = withCell(highlights, index, hidden?.highlights ?? {})
      notesInitialized = withCell(notesInitialized, index, hidden?.notesInitialized ?? false)
      hiddenCells = withCell(hiddenCells, index, null)
    }

    committed.push(index)
  }

  if (committed.length === 0) return

  commit({ context, refs, prop, computed }, { values, notes, highlights, notesInitialized, hiddenCells })

  for (const index of committed) {
    hooks.onCommit?.({ data: hooks.data(index), prevState })
  }
}

// ---------------------------------------------------------------------------
// Machine
// ---------------------------------------------------------------------------

export const machine = createMachine<SudokuSchema>({
  props({ props }) {
    return {
      layout: props.layout ?? SUDOKU_9X9,
      givens: props.givens ?? [],
      value: props.value,
      defaultValue: props.defaultValue,
      notes: props.notes,
      defaultNotes: props.defaultNotes,
      highlights: props.highlights,
      defaultHighlights: props.defaultHighlights,
      noteMode: props.noteMode,
      defaultNoteMode: props.defaultNoteMode,
      highlightMode: props.highlightMode,
      defaultHighlightMode: props.defaultHighlightMode,
      autoSolveOnClick: props.autoSolveOnClick ?? true,
      solution: props.solution,
      maxHistoryLength: props.maxHistoryLength ?? 200,
      disabled: props.disabled,
      id: props.id,
      onValueChange: props.onValueChange,
      onNotesChange: props.onNotesChange,
      onHighlightsChange: props.onHighlightsChange,
      onNoteModeChange: props.onNoteModeChange,
      onHighlightModeChange: props.onHighlightModeChange,
      onSolvedChange: props.onSolvedChange,
      shouldSetValue: props.shouldSetValue,
      onSetValue: props.onSetValue,
      shouldToggleNote: props.shouldToggleNote,
      onToggleNote: props.onToggleNote,
      shouldToggleNoteHighlight: props.shouldToggleNoteHighlight,
      onToggleNoteHighlight: props.onToggleNoteHighlight,
      shouldClearCellNotes: props.shouldClearCellNotes,
      onClearCellNotes: props.onClearCellNotes,
      shouldAutoSolveCell: props.shouldAutoSolveCell,
      onAutoSolveCell: props.onAutoSolveCell,
      shouldAutoNote: props.shouldAutoNote,
      onAutoNote: props.onAutoNote,
      shouldClearAllNotes: props.shouldClearAllNotes,
      onClearAllNotes: props.onClearAllNotes,
      shouldSetHighlightMode: props.shouldSetHighlightMode,
      onSetHighlightMode: props.onSetHighlightMode,
      shouldSetNoteMode: props.shouldSetNoteMode,
      onSetNoteMode: props.onSetNoteMode,
      shouldUndo: props.shouldUndo,
      onUndo: props.onUndo,
      shouldRedo: props.shouldRedo,
      onRedo: props.onRedo,
    }
  },

  initialState() {
    return 'idle'
  },

  context({ prop, bindable }) {
    return {
      values: bindable<Array<number | null>>(() => ({
        value: prop('value') ? fillValues(prop('value'), prop('givens')) : undefined,
        defaultValue: fillValues(prop('defaultValue'), prop('givens')),
        isEqual: arrayIsEqual,
        onChange(values) {
          prop('onValueChange')?.(values)
        },
      })),
      notes: bindable<number[][]>(() => ({
        value: prop('notes') ? fillNotes(prop('notes'), prop('layout').size) : undefined,
        defaultValue: fillNotes(prop('defaultNotes'), prop('layout').size),
        isEqual: arrayIsEqual,
        onChange(notes) {
          prop('onNotesChange')?.(notes)
        },
      })),
      highlights: bindable<Array<Record<number, SudokuHighlightKind>>>(() => ({
        value: prop('highlights') ? fillHighlights(prop('highlights'), prop('layout').size) : undefined,
        defaultValue: fillHighlights(prop('defaultHighlights'), prop('layout').size),
        isEqual: arrayIsEqual,
        onChange(highlights) {
          prop('onHighlightsChange')?.(highlights)
        },
      })),
      noteMode: bindable<boolean>(() => ({
        value: prop('noteMode'),
        defaultValue: prop('defaultNoteMode') ?? false,
        onChange(noteMode) {
          prop('onNoteModeChange')?.(noteMode)
        },
      })),
      highlightMode: bindable<SudokuHighlightKind>(() => ({
        value: prop('highlightMode'),
        defaultValue: prop('defaultHighlightMode') ?? 'box',
        onChange(highlightMode) {
          prop('onHighlightModeChange')?.(highlightMode)
        },
      })),
      notesInitialized: bindable<boolean[]>(() => ({
        defaultValue: Array.from({ length: prop('layout').size ** 2 }, () => false),
      })),
      hiddenCells: bindable<Array<SudokuHiddenCell | null>>(() => ({
        defaultValue: Array.from({ length: prop('layout').size ** 2 }, () => null),
      })),
      focusedIndex: bindable<number>(() => ({
        defaultValue: 0,
      })),
      selectedIndices: bindable<number[]>(() => ({
        defaultValue: [0],
      })),
    }
  },

  refs() {
    return { past: [], future: [] }
  },

  computed: {
    layout: ({ prop }) => resolveLayout(prop('layout')),
    given: ({ prop }) => prop('givens').map((value) => value != null),
    unitPlacedDigits: ({ context, computed }) => getUnitPlacedDigits(context.get('values'), computed('layout')),
    activePairs: ({ context, computed }) => getActivePairs(context.get('highlights'), computed('layout')),
    eliminated: ({ computed }) => getEliminated(computed('activePairs'), computed('layout')),
    remainingCandidates: ({ context, computed }) =>
      getRemainingCandidates(
        context.get('values'),
        computed('given'),
        computed('unitPlacedDigits'),
        computed('eliminated'),
        computed('layout'),
      ),
    singleCandidate: ({ context, computed }) =>
      getSingleCandidate(computed('remainingCandidates'), context.get('notes'), context.get('notesInitialized')),
    conflicts: ({ context, computed }) => getConflicts(context.get('values'), computed('layout')),
    scarceNotes: ({ context, computed }) =>
      getScarceNotes(context.get('notes'), context.get('highlightMode'), computed('layout')),
    complete: ({ context }) => context.get('values').every((value) => value != null),
    solved: ({ context, computed, prop }) => {
      if (!computed('complete')) return false
      if (computed('conflicts').some(Boolean)) return false
      const solution = prop('solution')
      if (!solution) return true
      return context.get('values').every((value, i) => value === solution[i])
    },
    canUndo: ({ refs }) => refs.get('past').length > 0,
    canRedo: ({ refs }) => refs.get('future').length > 0,
  },

  watch({ track, action, computed }) {
    track([() => computed('solved')], () => {
      action(['notifySolvedChange'])
    })
  },

  on: {
    'CELL.FOCUS': { actions: ['setFocusedIndex'] },
    'CELL.MOVE_FOCUS': { actions: ['moveFocus'] },
    'CELL.SELECT': { actions: ['selectCell'] },
    'CELL.TOGGLE_SELECTED': { actions: ['toggleSelected'] },
    'CELL.SET_VALUE': { actions: ['setCellValue'] },
    'CELL.TOGGLE_NOTE': { actions: ['toggleNote'] },
    'CELL.TOGGLE_NOTE_HIGHLIGHT': { actions: ['toggleNoteHighlight'] },
    'CELL.CLEAR_NOTES': { actions: ['clearCellNotes'] },
    'CELL.AUTO_SOLVE': { actions: ['autoSolveCell'] },
    'GRID.AUTO_NOTE': { actions: ['autoNoteGrid'] },
    'GRID.CLEAR_NOTES': { actions: ['clearAllNotesGrid'] },
    'HIGHLIGHT_MODE.SET': { actions: ['setHighlightMode'] },
    'NOTE_MODE.SET': { actions: ['setNoteMode'] },
    'HISTORY.UNDO': { actions: ['undo'] },
    'HISTORY.REDO': { actions: ['redo'] },
  },

  states: {
    idle: {},
  },

  implementations: {
    actions: {
      setFocusedIndex({ context, event }) {
        context.set('focusedIndex', event.index)
      },
      moveFocus({ context, event, computed }) {
        const { size } = computed('layout')
        const index = context.get('focusedIndex')
        const row = clamp(rowOf(index, size) + event.rowDelta, 0, size - 1)
        const col = clamp(colOf(index, size) + event.colDelta, 0, size - 1)
        const next = row * size + col
        context.set('focusedIndex', next)
        context.set('selectedIndices', [next])
      },
      selectCell({ context, event }) {
        context.set('focusedIndex', event.index)
        context.set('selectedIndices', [event.index])
      },
      toggleSelected({ context, event }) {
        // Reads `selectedIndices`, never `focusedIndex`, as the prior selection: a native
        // `focus` event always fires before `click` for a mouse interaction, and `onFocus`
        // unconditionally moves `focusedIndex` to the clicked cell before this action ever
        // runs — so by now `focusedIndex` already *is* `event.index`, and using it as "the
        // cell(s) selected before this click" would make a cell look like it's toggling
        // itself off on the very first Cmd/Ctrl+click of a selection. `selectedIndices` is
        // untouched by focus events, so it's not subject to that race.
        const { index } = event
        const base = context.get('selectedIndices')
        const next = base.includes(index) ? base.filter((i) => i !== index) : [...base, index]
        context.set('selectedIndices', next.length > 0 ? next : [index])
        context.set('focusedIndex', index)
      },
      setCellValue({ context, event, computed, refs, prop }) {
        const given = computed('given')
        if (given[event.index]) return
        const targets = resolveTargets(context.get('selectedIndices'), event.index).filter((i) => !given[i])
        if (targets.length === 0) return
        commitValue({ context, refs, prop, computed }, targets, event.digit, {
          data: (index) => ({ index, digit: event.digit }),
          shouldCommit: prop('shouldSetValue'),
          onCommit: prop('onSetValue'),
        })
      },
      toggleNote({ context, event, computed, refs, prop }) {
        const { digit } = event
        const given = computed('given')
        const values = context.get('values')
        const targets = resolveTargets(context.get('selectedIndices'), event.index).filter(
          (i) => !given[i] && values[i] == null,
        )
        if (targets.length === 0) return

        const prevState = buildStateSnapshot({ context, computed, prop })
        let notes = context.get('notes')
        let highlights = context.get('highlights')
        let notesInitialized = context.get('notesInitialized')
        const committed: number[] = []

        for (const index of targets) {
          const data = { index, digit }
          if (prop('shouldToggleNote')?.({ data, state: prevState }) === false) continue

          const cellNotes = notes[index]
          const has = cellNotes.includes(digit)
          const nextCellNotes = has ? cellNotes.filter((d) => d !== digit) : [...cellNotes, digit].sort((a, b) => a - b)
          notes = withCell(notes, index, nextCellNotes)

          if (has) {
            const cellHighlights = highlights[index]
            if (digit in cellHighlights) {
              const { [digit]: _removed, ...rest } = cellHighlights
              highlights = withCell(highlights, index, rest)
            }
            if (nextCellNotes.length === 0) {
              notesInitialized = withCell(notesInitialized, index, false)
            }
          }

          committed.push(index)
        }

        if (committed.length === 0) return
        commit({ context, refs, prop, computed }, { notes, highlights, notesInitialized })
        for (const index of committed) {
          prop('onToggleNote')?.({ data: { index, digit }, prevState })
        }
      },
      toggleNoteHighlight({ context, event, computed, refs, prop }) {
        const { digit } = event
        const given = computed('given')
        const values = context.get('values')
        const targets = resolveTargets(context.get('selectedIndices'), event.index).filter(
          (i) => !given[i] && values[i] == null,
        )
        if (targets.length === 0) return

        const mode = context.get('highlightMode')
        const prevState = buildStateSnapshot({ context, computed, prop })
        let notes = context.get('notes')
        let highlights = context.get('highlights')
        const committed: number[] = []

        for (const index of targets) {
          const data = { index, digit }
          if (prop('shouldToggleNoteHighlight')?.({ data, state: prevState }) === false) continue

          const cellNotes = notes[index]
          const cellHighlights = highlights[index]
          const hasNote = cellNotes.includes(digit)
          const currentKind = cellHighlights[digit]

          if (!hasNote) {
            notes = withCell(
              notes,
              index,
              [...cellNotes, digit].sort((a, b) => a - b),
            )
            highlights = withCell(highlights, index, { ...cellHighlights, [digit]: mode })
          } else if (currentKind === mode) {
            const { [digit]: _removed, ...rest } = cellHighlights
            highlights = withCell(highlights, index, rest)
          } else {
            highlights = withCell(highlights, index, { ...cellHighlights, [digit]: mode })
          }

          committed.push(index)
        }

        if (committed.length === 0) return
        commit({ context, refs, prop, computed }, { notes, highlights })
        for (const index of committed) {
          prop('onToggleNoteHighlight')?.({ data: { index, digit }, prevState })
        }
      },
      clearCellNotes({ context, event, computed, refs, prop }) {
        const targets = resolveTargets(context.get('selectedIndices'), event.index)
        const prevState = buildStateSnapshot({ context, computed, prop })
        let notes = context.get('notes')
        let highlights = context.get('highlights')
        let notesInitialized = context.get('notesInitialized')
        const committed: number[] = []

        for (const index of targets) {
          if (notes[index].length === 0 && Object.keys(highlights[index]).length === 0) continue
          const data = { index }
          if (prop('shouldClearCellNotes')?.({ data, state: prevState }) === false) continue

          notes = withCell(notes, index, [])
          highlights = withCell(highlights, index, {})
          notesInitialized = withCell(notesInitialized, index, false)
          committed.push(index)
        }

        if (committed.length === 0) return
        commit({ context, refs, prop, computed }, { notes, highlights, notesInitialized })
        for (const index of committed) {
          prop('onClearCellNotes')?.({ data: { index }, prevState })
        }
      },
      autoSolveCell({ context, event, computed, refs, prop }) {
        const { index } = event
        if (computed('given')[index]) return
        if (context.get('values')[index] != null) return
        const digit = computed('singleCandidate')[index]
        if (digit == null) return
        commitValue({ context, refs, prop, computed }, [index], digit, {
          data: (i) => ({ index: i }),
          shouldCommit: prop('shouldAutoSolveCell'),
          onCommit: prop('onAutoSolveCell'),
        })
      },
      autoNoteGrid({ context, computed, refs, prop }) {
        const notes = context.get('notes')
        const highlights = context.get('highlights')
        const notesInitialized = context.get('notesInitialized')
        const remaining = computed('remainingCandidates')
        const given = computed('given')
        const values = context.get('values')

        const nextNotes = notes.map((cellNotes, i) => {
          if (given[i] || values[i] != null) return cellNotes
          const highlighted = Object.keys(highlights[i]).map(Number)
          return Array.from(new Set([...highlighted, ...remaining[i]])).sort((a, b) => a - b)
        })
        const nextNotesInitialized = notesInitialized.map((flag, i) => (given[i] || values[i] != null ? flag : true))

        commit(
          { context, refs, prop, computed },
          { notes: nextNotes, notesInitialized: nextNotesInitialized },
          { data: undefined, shouldCommit: prop('shouldAutoNote'), onCommit: prop('onAutoNote') },
        )
      },
      clearAllNotesGrid({ context, computed, refs, prop }) {
        commit(
          { context, refs, prop, computed },
          {
            notes: context.get('notes').map(() => [] as number[]),
            highlights: context.get('highlights').map(() => ({}) as Record<number, SudokuHighlightKind>),
            notesInitialized: context.get('notesInitialized').map(() => false),
            hiddenCells: context.get('hiddenCells').map(() => null),
          },
          { data: undefined, shouldCommit: prop('shouldClearAllNotes'), onCommit: prop('onClearAllNotes') },
        )
      },
      setHighlightMode({ context, event, computed, prop }) {
        const data = { mode: event.mode }
        const prevState = buildStateSnapshot({ context, computed, prop })
        if (prop('shouldSetHighlightMode')?.({ data, state: prevState }) === false) return
        context.set('highlightMode', event.mode)
        prop('onSetHighlightMode')?.({ data, prevState })
      },
      setNoteMode({ context, event, computed, prop }) {
        const data = { enabled: event.enabled }
        const prevState = buildStateSnapshot({ context, computed, prop })
        if (prop('shouldSetNoteMode')?.({ data, state: prevState }) === false) return
        context.set('noteMode', event.enabled)
        prop('onSetNoteMode')?.({ data, prevState })
      },
      undo({ context, refs, computed, prop }) {
        const past = refs.get('past')
        if (past.length === 0) return
        const prevState = buildStateSnapshot({ context, computed, prop })
        if (prop('shouldUndo')?.({ data: undefined, state: prevState }) === false) return
        const previous = past[past.length - 1]
        const current = snapshot({ context })
        refs.set('past', past.slice(0, -1))
        refs.set('future', [...refs.get('future'), current])
        context.set('values', previous.values)
        context.set('notes', previous.notes)
        context.set('highlights', previous.highlights)
        context.set('notesInitialized', previous.notesInitialized)
        context.set('hiddenCells', previous.hiddenCells)
        context.set('noteMode', previous.noteMode)
        context.set('highlightMode', previous.highlightMode)
        prop('onUndo')?.({ data: undefined, prevState })
      },
      redo({ context, refs, computed, prop }) {
        const future = refs.get('future')
        if (future.length === 0) return
        const prevState = buildStateSnapshot({ context, computed, prop })
        if (prop('shouldRedo')?.({ data: undefined, state: prevState }) === false) return
        const next = future[future.length - 1]
        const current = snapshot({ context })
        refs.set('future', future.slice(0, -1))
        refs.set('past', [...refs.get('past'), current])
        context.set('values', next.values)
        context.set('notes', next.notes)
        context.set('highlights', next.highlights)
        context.set('notesInitialized', next.notesInitialized)
        context.set('hiddenCells', next.hiddenCells)
        context.set('noteMode', next.noteMode)
        context.set('highlightMode', next.highlightMode)
        prop('onRedo')?.({ data: undefined, prevState })
      },
      notifySolvedChange({ prop, computed }) {
        prop('onSolvedChange')?.(computed('solved'))
      },
    },
  },
})
