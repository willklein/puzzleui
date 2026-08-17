import { useSudokuContext } from '../lib/sudoku'

/**
 * Selecting a cell with a committed value (given or entered) highlights every other cell
 * sharing that value, using the same tint for any cell that merely has a *note* for that
 * digit — a softer "this could also go here" signal alongside the "this already is that
 * digit" cells. Built entirely from Sudoku's public Api (`focusedIndex`, `values`) and the
 * `data-value`/`data-digit`/`data-part` attributes it already emits — no changes to the
 * library itself. Render as a child of `<Sudoku.Root>`, alongside its other parts.
 */
export function SudokuSameValueHighlight() {
  const sudoku = useSudokuContext()
  const selectedValue = sudoku.values[sudoku.focusedIndex]

  if (selectedValue == null) return null

  return (
    <style>{`
      [data-scope='sudoku'][data-part='cell'][data-value='${selectedValue}'] {
        background: var(--sudoku-same-value-bg);
      }
      [data-scope='sudoku'][data-part='note'][data-digit='${selectedValue}'][data-visible] {
        background: var(--sudoku-same-value-bg);
        border-radius: 2px;
      }
    `}</style>
  )
}
