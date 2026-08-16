import type { Meta, StoryObj } from '@storybook/react-vite'
import {
  Sudoku,
  SUDOKU_4X4,
  SUDOKU_6X6,
  SUDOKU_9X9,
  type SudokuHighlightKind,
  type SudokuLayout,
  type SudokuProps,
} from '../../src/lib/sudoku'

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
const NINE_BY_NINE_SOLVED: Array<number | null> = [
  5, 3, 4,  6, 7, 8,  9, 1, 2,
  6, 7, 2,  1, 9, 5,  3, 4, 8,
  1, 9, 8,  3, 4, 2,  5, 6, 7,

  8, 5, 9,  7, 6, 1,  4, 2, 3,
  4, 2, 6,  8, 5, 3,  7, 9, 1,
  7, 1, 3,  9, 2, 4,  8, 5, 6,

  9, 6, 1,  5, 3, 7,  2, 8, 4,
  2, 8, 7,  4, 1, 9,  6, 3, 5,
  3, 4, 5,  2, 8, 6,  1, 7, 9,
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

function emptyGivens(layout: SudokuLayout): Array<number | null> {
  return Array.from({ length: layout.size * layout.size }, () => null)
}

function emptyNotes(layout: SudokuLayout): number[][] {
  return Array.from({ length: layout.size * layout.size }, () => [])
}

function emptyHighlights(layout: SudokuLayout): Array<Record<number, SudokuHighlightKind>> {
  return Array.from({ length: layout.size * layout.size }, () => ({}))
}

type SudokuDemoProps = Pick<
  SudokuProps,
  | 'layout'
  | 'givens'
  | 'defaultValue'
  | 'defaultNotes'
  | 'defaultHighlights'
  | 'defaultNoteMode'
  | 'defaultHighlightMode'
  | 'disabled'
  | 'onSolvedChange'
>

function SudokuDemo({ layout = SUDOKU_9X9, givens, ...rest }: SudokuDemoProps) {
  return (
    <Sudoku.Root className="sudoku" layout={layout} givens={givens ?? emptyGivens(layout)} {...rest}>
      <Sudoku.SolvedIndicator className="sudoku-solved" fallback={<span>Keep going…</span>}>
        Solved!
      </Sudoku.SolvedIndicator>
    </Sudoku.Root>
  )
}

const meta: Meta<typeof SudokuDemo> = {
  title: 'Components/Sudoku',
  component: SudokuDemo,
  parameters: {
    layout: 'centered',
  },
  args: {
    disabled: false,
  },
}

export default meta
type Story = StoryObj<typeof SudokuDemo>

/** Arrow keys move focus; digit keys set a value (or toggle a note, once Notes mode is on). */
export const Default: Story = {
  args: {
    layout: SUDOKU_9X9,
    givens: NINE_BY_NINE,
  },
}

/** 6x6: boxes are 3 columns x 2 rows, laid out 2 boxes across x 3 boxes down. */
export const SixBySix: Story = {
  args: {
    layout: SUDOKU_6X6,
    givens: SIX_BY_SIX,
  },
}

/** 4x4: boxes are 2x2, laid out 2 across x 2 down. */
export const FourByFour: Story = {
  args: {
    layout: SUDOKU_4X4,
    givens: FOUR_BY_FOUR,
  },
}

/** Pre-filled candidate notes — some plain, one pair already marked highlighted (box mode). */
export const NoteMode: Story = {
  render: () => {
    const layout = SUDOKU_9X9
    const notes = emptyNotes(layout)
    const highlights = emptyHighlights(layout)

    notes[0] = [1, 4, 5] // row 0, col 0
    notes[1] = [4, 5] // row 0, col 1 — the highlighted pair below
    notes[9] = [4, 5, 7] // row 1, col 0
    highlights[1] = { 5: 'box' }
    highlights[10] = { 5: 'box' } // row 1, col 1 — same box as cell 1, completes the pair
    notes[10] = [5, 6]

    return (
      <Sudoku.Root
        className="sudoku"
        layout={layout}
        givens={emptyGivens(layout)}
        defaultNotes={notes}
        defaultHighlights={highlights}
        defaultNoteMode
      >
        <Sudoku.SolvedIndicator className="sudoku-solved" fallback={<span>Keep going…</span>}>
          Solved!
        </Sudoku.SolvedIndicator>
      </Sudoku.Root>
    )
  },
}

/**
 * A box-pair (digit 5, cells (0,1) and (1,1) — both box 0) that also happens to share
 * column 1: the "pointing pair"/"box-line reduction" propagation crosses digit 5 out
 * both elsewhere in box 0 and elsewhere in column 1, wherever it's already noted.
 */
export const ActivePairHighlight: Story = {
  render: () => {
    const layout = SUDOKU_9X9
    const notes = emptyNotes(layout)
    const highlights = emptyHighlights(layout)

    highlights[1] = { 5: 'box' } // row 0, col 1
    notes[1] = [5]
    highlights[10] = { 5: 'box' } // row 1, col 1 — same box, completes the pair
    notes[10] = [5]

    notes[9] = [3, 5, 8] // row 1, col 0 — same box, digit 5 crossed out
    notes[19] = [2, 5] // row 2, col 1 — same column, digit 5 crossed out too

    return (
      <Sudoku.Root
        className="sudoku"
        layout={layout}
        givens={emptyGivens(layout)}
        defaultNotes={notes}
        defaultHighlights={highlights}
        defaultNoteMode
      >
        <Sudoku.SolvedIndicator className="sudoku-solved" fallback={<span>Keep going…</span>}>
          Solved!
        </Sudoku.SolvedIndicator>
      </Sudoku.Root>
    )
  },
}

/** Fully filled in and solved. */
export const Solved: Story = {
  args: {
    layout: SUDOKU_9X9,
    givens: NINE_BY_NINE,
    defaultValue: NINE_BY_NINE_SOLVED,
  },
}
