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
}

/**
 * A cell with its own tap gesture instead of the library's default click behavior — `getCellProps`'s
 * own `onClick` can't be swapped out from under `Sudoku.Cell` (Zag's `mergeProps` *composes* handlers
 * rather than letting a later one replace an earlier one), so this reimplements cell rendering
 * directly from the public Api (`getCellProps`, `Sudoku.Note`) with a custom `onClick`:
 *   - a digit is "armed" (tapped on the pad while no cell was focused): place it directly, paint-style.
 *   - the cell already has a value: focus it and arm its digit, so its value is what's highlighted.
 *   - otherwise (an empty cell, no digit armed): fold it into a touch multi-selection.
 * The roving-tabindex focus-sync effect is copied from `sudoku-cell.tsx` — it's the one thing that
 * still has to run per cell for keyboard nav to keep working alongside the tap gesture.
 */
function SudokuMobileCell({ sudoku, index, highlightedDigit, onHighlightDigit }: SudokuMobileCellProps) {
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
      sudoku.selectCell(index)
      if (sudoku.noteMode) sudoku.toggleNote(index, highlightedDigit)
      else sudoku.setValue(index, highlightedDigit)
      return
    }
    if (value != null) {
      sudoku.selectCell(index)
      onHighlightDigit(value)
      return
    }
    sudoku.toggleSelected(index)
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

  const focusedIndex = sudoku.focusedIndex
  const canFilterDigits = gridHasFocus && !sudoku.given[focusedIndex] && sudoku.values[focusedIndex] == null
  const eligibleDigits = canFilterDigits ? new Set(sudoku.remainingCandidates[focusedIndex]) : null

  function handleDigitTap(digit: number) {
    if (gridHasFocus) {
      if (sudoku.noteMode) sudoku.toggleNote(focusedIndex, digit)
      else sudoku.setValue(focusedIndex, digit)
    } else {
      setHighlightedDigit((current) => (current === digit ? null : digit))
    }
  }

  return (
    <div className="sudoku-mobile-page">
      <Sudoku.Root model={sudoku} renderGrid={false} className="sudoku sudoku-mobile">
        <div
          className="sudoku-mobile-grid"
          onFocus={() => setGridHasFocus(true)}
          onBlur={(event) => {
            const next = event.relatedTarget as HTMLElement | null
            if (event.currentTarget.contains(next)) return
            setGridHasFocus(false)
            // A tap on a button (toolbar or digit pad) shouldn't collapse a selection or clear
            // the armed digit that was just built up to hand off to it — only "tapped
            // elsewhere" (outside cells and buttons) should reset both.
            if (!(next instanceof HTMLButtonElement)) {
              sudoku.selectCell(sudoku.focusedIndex)
              setHighlightedDigit(null)
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
            <button
              type="button"
              className="sudoku-mobile-erase-trigger"
              disabled={!gridHasFocus}
              // Same reasoning as the digit pad: a real tap starts with a native focus-shift on
              // pointerdown, which blurs the grid before the click is even delivered — and this
              // button re-renders as disabled the instant that blur sets gridHasFocus false,
              // which makes the browser drop the pending click entirely (an element disabled
              // between pointerdown and click never receives it). Keeping focus on the grid
              // avoids the blur, the mid-gesture disable, and the dropped click all at once.
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => sudoku.setValue(focusedIndex, null)}
            >
              Erase
            </button>
            <div className="sudoku-mobile-undo-row">
              <Sudoku.UndoTrigger />
              {sudoku.canRedo && <Sudoku.RedoTrigger />}
            </div>
          </div>

          <div className="sudoku-mobile-digitpad">
            {DIGITS.map((digit) => (
              <button
                key={digit}
                type="button"
                className="sudoku-mobile-digit"
                data-hidden={eligibleDigits != null && !eligibleDigits.has(digit) ? '' : undefined}
                data-active={highlightedDigit === digit ? '' : undefined}
                aria-hidden={eligibleDigits != null && !eligibleDigits.has(digit) ? true : undefined}
                tabIndex={eligibleDigits != null && !eligibleDigits.has(digit) ? -1 : 0}
                // Keeps whatever cell is focused focused — a tap here must not steal DOM focus
                // away from the grid, since that's what tells this page whether to enter the
                // digit into the focused cell or toggle the tap-to-highlight behavior instead.
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => handleDigitTap(digit)}
              >
                {digit}
              </button>
            ))}
          </div>
        </div>
      </Sudoku.Root>
    </div>
  )
}
