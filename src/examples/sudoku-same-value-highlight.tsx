import { useSudokuContext } from '../lib/sudoku'

/**
 * Selecting a cell with a committed value (given or entered — a note-only cell never matches,
 * since Sudoku.Cell renders either a value or its notes, never both) highlights every other cell
 * sharing that value. Built entirely from Sudoku's public Api (`focusedIndex`, `values`) and the
 * `data-value`/`data-part` attributes it already emits — no changes to the library itself.
 * Render as a child of `<Sudoku.Root>`, alongside its other parts.
 */
export function SudokuSameValueHighlight() {
  const sudoku = useSudokuContext()
  const selectedValue = sudoku.values[sudoku.focusedIndex]

  if (selectedValue == null) return null

  return (
    <style>{`[data-scope='sudoku'][data-part='cell'][data-value='${selectedValue}'] { background: var(--sudoku-same-value-bg); }`}</style>
  )
}
