import { useState } from 'react'
import { Sudoku, useSudoku, SUDOKU_9X9 } from '../lib/sudoku'
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

/**
 * A mobile-oriented Sudoku demo at `/sudoku` (not a Storybook story): a digit pad replaces
 * relying on a physical keyboard. Built with `Sudoku.Root`'s `model`/`renderGrid` props so this
 * component can own the puzzle instance directly, alongside two bits of state the library has
 * no opinion on: whether the grid currently has real focus, and which digit (if any) is
 * highlighted via a pad tap while it doesn't.
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
      <header className="sudoku-mobile-header">
        <h1>Sudoku</h1>
      </header>

      <Sudoku.Root model={sudoku} renderGrid={false} className="sudoku sudoku-mobile">
        <div
          className="sudoku-mobile-grid"
          onFocus={() => setGridHasFocus(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setGridHasFocus(false)
            }
          }}
        >
          <Sudoku.Grid />
        </div>

        <SudokuSameValueHighlight digit={gridHasFocus ? undefined : highlightedDigit} />

        <Sudoku.SolvedIndicator className="sudoku-solved" fallback={<span>Keep going…</span>}>
          Solved!
        </Sudoku.SolvedIndicator>

        <div className="sudoku-mobile-controls">
          <Sudoku.Toolbar className="sudoku-mobile-toolbar" />

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
