import { useEffect, useRef, useState } from 'react'
import { Sudoku, useSudoku, SUDOKU_9X9, type UseSudokuReturn } from '../lib/sudoku'
import { SudokuSameValueHighlight } from '../examples/sudoku-same-value-highlight'

// The classic example puzzle from Wikipedia's Sudoku article.
// prettier-ignore
const NINE_BY_NINE: Array<number | null> = [
  5, 3, null,  null, 7, null,  null, null, null,
  6, null, null,  1, 9, 5,  null, null, null,
  null, 9, 8,  null, null, null,  null, 6, null,

  8, null, null,  null, 6, null,  null, null, 3,
  4, null, null,  8, null, 3,  null, null, 1,
  7, null, null,  null, 2, null,  null, null, 6,

  null, 6, null,  null, null, null,  2, 8, null,
  null, null, null,  4, 1, 9,  null, null, 5,
  null, null, null,  null, 8, null,  null, 7, 9,
]

const DIGITS = Array.from({ length: 9 }, (_, i) => i + 1)

interface SudokuMobileCellProps {
  sudoku: UseSudokuReturn
  index: number
  highlightedDigit: number | null
  onHighlightDigit: (digit: number | null) => void
  /**
   * Whether the *previous* cell-targeting action left an in-progress multi-selection to extend.
   * Deliberately a ref, not the `gridHasFocus` state: a real tap on a not-yet-focused cell
   * button fires the browser's native `focus` (and therefore this page's `onFocus`) *before*
   * the `click` that runs `handleClick` — so by the time any state set from `onFocus` is read
   * here, it already reflects this very tap's own focus, not whatever was true beforehand.
   * A ref written synchronously inside click handlers themselves has no such race.
   */
  selectionSessionRef: React.MutableRefObject<boolean>
}

/**
 * A cell with its own tap gesture instead of the library's default click behavior — `getCellProps`'s
 * own `onClick` can't be swapped out from under `Sudoku.Cell` (Zag's `mergeProps` *composes* handlers
 * rather than letting a later one replace an earlier one), so this reimplements cell rendering
 * directly from the public Api (`getCellProps`, `Sudoku.Note`) with a custom `onClick`:
 *   - a digit is "armed" (tapped on the pad while no cell was focused): place it directly, paint-style.
 *   - the cell already has a value: focus it and arm its digit, so its value is what's highlighted.
 *   - otherwise (an empty cell, no digit armed): extend the touch multi-selection being built by
 *     consecutive taps if one is already in progress (`selectionSessionRef`), or start a fresh one.
 * The roving-tabindex focus-sync effect is copied from `sudoku-cell.tsx` — it's the one thing that
 * still has to run per cell for keyboard nav to keep working alongside the tap gesture.
 */
function SudokuMobileCell({
  sudoku,
  index,
  highlightedDigit,
  onHighlightDigit,
  selectionSessionRef,
}: SudokuMobileCellProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const value = sudoku.values[index]
  const noteColumns = Math.ceil(Math.sqrt(sudoku.layout.size))
  const cellStyle = { '--sudoku-note-columns': noteColumns } as React.CSSProperties

  useEffect(() => {
    if (sudoku.focusedIndex === index && document.activeElement !== buttonRef.current) {
      buttonRef.current?.focus()
    }
  }, [sudoku.focusedIndex, index])

  function handleClick() {
    if (highlightedDigit != null) {
      selectionSessionRef.current = false
      sudoku.selectCell(index)
      if (sudoku.noteMode) sudoku.toggleNote(index, highlightedDigit)
      else sudoku.setValue(index, highlightedDigit)
      return
    }
    if (value != null) {
      selectionSessionRef.current = false
      sudoku.selectCell(index)
      onHighlightDigit(value)
      return
    }
    // Extend the selection being built by consecutive taps only if one is already in progress;
    // otherwise start a fresh, single-cell one and mark a session as now in progress for the
    // *next* tap to extend. This has to be a ref, not the `gridHasFocus` state — see the prop's
    // doc comment for why that races with a real tap on a not-yet-focused cell.
    if (selectionSessionRef.current) {
      sudoku.toggleSelected(index)
    } else {
      sudoku.selectCell(index)
      selectionSessionRef.current = true
    }
  }

  return (
    <button {...sudoku.getCellProps(index)} style={cellStyle} onClick={handleClick} ref={buttonRef}>
      {value != null
        ? value
        : Array.from({ length: sudoku.layout.size }, (_, i) => <Sudoku.Note key={i + 1} index={index} digit={i + 1} />)}
    </button>
  )
}

/**
 * A mobile-oriented Sudoku demo at `/sudoku` (not a Storybook story): a digit pad replaces relying
 * on a physical keyboard. Built with `Sudoku.Root`'s `model`/`renderGrid` props so this component can
 * own the puzzle instance directly, alongside state the library has no opinion on: whether the grid
 * currently has real focus, and which digit (if any) is "armed" via a pad tap or a tap on a filled
 * cell.
 */
export function SudokuPage() {
  const sudoku = useSudoku({ layout: SUDOKU_9X9, givens: NINE_BY_NINE })
  const [gridHasFocus, setGridHasFocus] = useState(false)
  const [highlightedDigit, setHighlightedDigit] = useState<number | null>(null)
  const selectionSessionRef = useRef(false)

  const focusedIndex = sudoku.focusedIndex
  const canFilterDigits = gridHasFocus && !sudoku.given[focusedIndex] && sudoku.values[focusedIndex] == null
  const eligibleDigits = canFilterDigits ? new Set(sudoku.remainingCandidates[focusedIndex]) : null

  // A digit is "solved" once it's been placed all `layout.size` times with none of those
  // placements conflicting with each other — i.e. it legally occupies every row, column, and
  // box exactly once. That's a rule-validity check, not a solution check: it doesn't require
  // any placement to be in its *correct* cell, only that the digit itself is fully and validly
  // placed, so there's nothing left to enter it into.
  const solvedDigits = new Set(
    DIGITS.filter((digit) => {
      let placements = 0
      let hasConflict = false
      for (let cell = 0; cell < sudoku.values.length; cell++) {
        if (sudoku.values[cell] !== digit) continue
        placements++
        if (sudoku.conflicts[cell]) hasConflict = true
      }
      return placements === sudoku.layout.size && !hasConflict
    }),
  )

  function handleDigitTap(digit: number) {
    // Tapping the already-armed digit again always just deselects it — regardless of whether a
    // cell happens to be focused — rather than re-committing into that cell a second time. This
    // has to be checked before the `gridHasFocus` branch below, or "unselect" would instead
    // re-toggle whatever note was just placed with this digit.
    if (highlightedDigit === digit) {
      setHighlightedDigit(null)
      return
    }
    if (gridHasFocus) {
      // Committing into the focused cell targets that one cell, same as a direct cell tap —
      // it must not leave a selection session for the *next* empty-cell tap to extend into.
      selectionSessionRef.current = false
      if (sudoku.noteMode) sudoku.toggleNote(focusedIndex, digit)
      else sudoku.setValue(focusedIndex, digit)
    }
    // Arm the digit explicitly rather than relying on SudokuSameValueHighlight's
    // focused-cell-value fallback: that fallback only holds up while focus stays on this
    // exact cell, but moving to a different cell next (or moving focus away entirely) would
    // silently drop the highlight even though the digit is still the one in play.
    setHighlightedDigit(digit)
  }

  return (
    <div
      className="sudoku-mobile-page"
      onClick={(event) => {
        // The grid's own onBlur (below) clears an armed digit when a focused cell loses focus —
        // but a digit armed straight from the pad, with no cell ever focused, has nothing to
        // blur *from*, so that handler never fires for it. Catch that case here instead: a tap
        // anywhere outside every button, while nothing is focused, also deselects the digit.
        // Once a cell has focus, onBlur already owns this, so this only acts while it can't.
        if (gridHasFocus || highlightedDigit == null) return
        if ((event.target as HTMLElement).closest('button')) return
        setHighlightedDigit(null)
      }}
    >
      <Sudoku.Root model={sudoku} renderGrid={false} className="sudoku sudoku-mobile">
        <div
          className="sudoku-mobile-grid"
          data-has-focus={gridHasFocus ? '' : undefined}
          onFocus={() => setGridHasFocus(true)}
          onBlur={(event) => {
            const next = event.relatedTarget as HTMLElement | null
            if (event.currentTarget.contains(next)) return
            // A tap on a button (toolbar or digit pad) shouldn't collapse a selection, clear the
            // armed digit, or forget the grid has focus — a toolbar tap (Notes, a highlight-mode
            // button, Undo, ...) is part of the same editing flow, not a "tapped elsewhere" that
            // should reset any of this. Only a genuine tap outside cells and buttons should.
            if (!(next instanceof HTMLButtonElement)) {
              setGridHasFocus(false)
              sudoku.selectCell(sudoku.focusedIndex)
              setHighlightedDigit(null)
              selectionSessionRef.current = false
            }
          }}
        >
          <div
            {...sudoku.getGridProps()}
            style={
              {
                '--sudoku-size': sudoku.layout.size,
                '--sudoku-boxes-across': sudoku.layout.boxesAcross,
                '--sudoku-boxes-down': sudoku.layout.boxesDown,
              } as React.CSSProperties
            }
          >
            {Array.from({ length: sudoku.layout.size * sudoku.layout.size }, (_, index) => (
              <SudokuMobileCell
                key={index}
                sudoku={sudoku}
                index={index}
                highlightedDigit={highlightedDigit}
                onHighlightDigit={setHighlightedDigit}
                selectionSessionRef={selectionSessionRef}
              />
            ))}
          </div>
        </div>

        {/* An armed digit always wins (survives note-mode toggling, a note-only paint tap, etc.);
            otherwise fall back to the focused cell's own value — but only while the grid
            actually has focus, so the highlight doesn't linger from a stale focusedIndex once
            the grid's been tapped away from. */}
        <SudokuSameValueHighlight digit={highlightedDigit ?? (gridHasFocus ? undefined : null)} />

        <Sudoku.SolvedIndicator className="sudoku-solved" fallback={<span>Keep going…</span>}>
          Solved!
        </Sudoku.SolvedIndicator>

        <div className="sudoku-mobile-controls">
          <div className="sudoku-mobile-toolbar" data-scope="sudoku" data-part="toolbar">
            <Sudoku.NoteModeToggle>Notes</Sudoku.NoteModeToggle>
            <Sudoku.HighlightModeToggle mode="box" />
            <Sudoku.HighlightModeToggle mode="row" />
            <Sudoku.HighlightModeToggle mode="col" />
            <Sudoku.AutoNoteTrigger />
            <Sudoku.EraseTrigger />
            <div className="sudoku-mobile-undo-row">
              <Sudoku.UndoTrigger />
              {sudoku.canRedo && <Sudoku.RedoTrigger />}
            </div>
          </div>

          <div className="sudoku-mobile-digitpad">
            {DIGITS.map((digit) => {
              const hidden = solvedDigits.has(digit) || (eligibleDigits != null && !eligibleDigits.has(digit))
              return (
                <button
                  key={digit}
                  type="button"
                  className="sudoku-mobile-digit"
                  data-hidden={hidden ? '' : undefined}
                  data-active={highlightedDigit === digit ? '' : undefined}
                  aria-hidden={hidden ? true : undefined}
                  tabIndex={hidden ? -1 : 0}
                  // Keeps whatever cell is focused focused — a tap here must not steal DOM focus
                  // away from the grid, since that's what tells this page whether to enter the
                  // digit into the focused cell or toggle the tap-to-highlight behavior instead.
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => handleDigitTap(digit)}
                >
                  {digit}
                </button>
              )
            })}
          </div>
        </div>
      </Sudoku.Root>
    </div>
  )
}
