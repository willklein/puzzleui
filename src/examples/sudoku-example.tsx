import { useState } from 'react'
import { Sudoku, SUDOKU_4X4, SUDOKU_6X6, SUDOKU_9X9, type SudokuLayout } from '../lib/sudoku'
import { SudokuDocs } from '../docs/sudoku-docs'

interface SudokuPreset {
  value: string
  label: string
  layout: SudokuLayout
  givens: Array<number | null>
}

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

// prettier-ignore
const SIX_BY_SIX: Array<number | null> = [
  1, null, 3,  null, 5, null,
  null, 5, null,  1, null, 3,

  2, null, 1,  null, 6, null,
  null, 6, null,  2, null, 1,

  3, null, 2,  null, 4, null,
  null, 4, null,  3, null, 2,
]

// prettier-ignore
const FOUR_BY_FOUR: Array<number | null> = [
  1, null, 3, null,
  null, 4, null, 2,

  2, null, 4, null,
  null, 3, null, 1,
]

const PRESETS: SudokuPreset[] = [
  { value: '9x9', label: '9×9', layout: SUDOKU_9X9, givens: NINE_BY_NINE },
  { value: '6x6', label: '6×6', layout: SUDOKU_6X6, givens: SIX_BY_SIX },
  { value: '4x4', label: '4×4', layout: SUDOKU_4X4, givens: FOUR_BY_FOUR },
]

export function SudokuExample() {
  const [presetValue, setPresetValue] = useState(PRESETS[0].value)
  const preset = PRESETS.find((p) => p.value === presetValue) ?? PRESETS[0]

  return (
    <div className="example">
      <div className="example-toolbar">
        <p className="example-intro">
          Fill every row, column, and box with 1..size, no repeats. Toggle Notes to pencil in candidates; Shift+digit
          marks a pair using the active highlight mode (box/row/col) — the component automatically crosses that digit
          out everywhere it's no longer possible.
        </p>
        <div className="sudoku-preset-picker">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              data-active={p.value === presetValue}
              onClick={() => setPresetValue(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <Sudoku.Root key={preset.value} className="sudoku" layout={preset.layout} givens={preset.givens}>
        <Sudoku.Toolbar />
        <Sudoku.SolvedIndicator className="sudoku-solved" fallback={<span>Keep going…</span>}>
          Solved!
        </Sudoku.SolvedIndicator>
      </Sudoku.Root>

      <div className="example-docs">
        <SudokuDocs />
      </div>
    </div>
  )
}
