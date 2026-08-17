import { useSudokuContext } from '../lib/sudoku'

export interface SudokuSameValueHighlightProps {
  /**
   * Overrides which digit to highlight instead of deriving it from the focused cell's value —
   * e.g. a mobile digit pad highlighting a tapped digit while no cell is focused. Omit to use
   * the focused cell's value (the default, desktop-oriented behavior); pass `null` explicitly
   * to force "nothing highlighted" regardless of focus.
   */
  digit?: number | null
}

/**
 * Selecting a cell with a committed value (given or entered) highlights every other cell
 * sharing that value, using the same tint for any cell that merely has a *note* for that
 * digit — a softer "this could also go here" signal alongside the "this already is that
 * digit" cells. Built entirely from Sudoku's public Api (`focusedIndex`, `values`) and the
 * `data-value`/`data-digit`/`data-part` attributes it already emits — no changes to the
 * library itself. Render as a child of `<Sudoku.Root>`, alongside its other parts.
 */
export function SudokuSameValueHighlight({ digit }: SudokuSameValueHighlightProps = {}) {
  const sudoku = useSudokuContext()
  const selectedValue = digit === undefined ? sudoku.values[sudoku.focusedIndex] : digit

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
